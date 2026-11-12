---
title: "Kubernetes Platform Architecture"
weight: 1
featured: true
metric: "No downtime"
metric_note: "ECS to EKS, no maintenance window"
problem: "A game company with no internal platform needed one that studio teams could ship on without each team rebuilding infrastructure from scratch."
role: "Designed the architecture end to end, then led the function that ran it"
scale: "Multiple game studios, teams across four countries"
outcome: "Zero-downtime cutovers from ECS to EKS; a documented decision process that outlived individual projects"
stack: ["EKS", "Istio Ambient", "ArgoCD", "Karpenter", "KEDA", "Kyverno", "Crossplane", "Terraform"]
description: "Designing a production Kubernetes platform from nothing at Fortis Games: EKS, GitOps, service mesh, autoscaling, policy, and the operating model that made it usable."
---

## Context

Fortis Games was building game studios and had no internal platform. Every team that
needed a service running needed networking, deployment, secrets, monitoring and DNS, and
without somewhere shared to get those, each team would have solved them separately and
differently. I joined as infrastructure technical lead and the platform was the first
thing to design.

The requirement wasn't "run Kubernetes." It was that a studio team should be able to ship
a service without having to learn how the infrastructure underneath it is wired.

## Constraints

The engineering team was spread across Brazil, Portugal, England and Canada, an
eight-hour spread. Nothing could require everyone awake at the same time, which rules out
a platform that depends on tribal knowledge or on asking me.

Workloads were already running on ECS. The platform had to be somewhere existing services
could move to without a maintenance window, because game traffic doesn't have a
convenient quiet hour.

## My role

I designed the architecture: networking, GitOps, autoscaling, service mesh, secrets,
policy, observability, DNS and ingress. After being promoted to run DevOps Engineering I
kept platform architecture and technical direction while the function grew to four area
leaders, covering CI/CD, SRE, platform and AI infrastructure.

## Architecture and decisions

The platform is EKS, with each layer chosen to be something a product team never has to
think about.

{{< architecture svg="kubernetes-platform" label="Platform architecture" caption="Grouped by domain, with every line labelled by what one component does to another. The diagram states responsibilities and relationships, not topology: cluster counts, network layout and addressing are not published." >}}
### Domains

- **Delivery** holds Git, which carries desired state, and Argo CD, which reconciles against it.
- **Kyverno** is the admission gate. Everything entering the cluster passes through it.
- **Cluster, on EKS** holds the application workloads, Istio in ambient mode, KEDA and Karpenter.
- **Platform services** are External Secrets, ExternalDNS, cert-manager and Datadog.
- **Outside the cluster** holds Terraform, Crossplane and the AWS resources they manage.

### Relationships

- Argo CD reads desired state from Git.
- Argo CD applies manifests through Kyverno.
- Kyverno admits workloads into the cluster, or denies them.
- KEDA scales workloads on the signal that drives them.
- Karpenter adds nodes for pods that are pending.
- Istio connects the workloads, with mTLS and L4 per node and L7 at waypoint proxies.
- External Secrets, ExternalDNS and cert-manager supply secrets, DNS and certificates to workloads.
- Datadog observes the workloads.
- Terraform provisions the cluster and the accounts underneath it.
- Workloads claim managed dependencies through Crossplane.
- Crossplane provisions the AWS resources behind those claims.
{{< /architecture >}}

Delivery runs through GitOps. ArgoCD reconciles cluster state from Git, so the cluster's
contents are reviewable and a rollback is a revert. Letting CI push with cluster
credentials would have put production write access into every pipeline, with no single
description of what's supposed to be running.

The mesh is Istio in ambient mode, with waypoint proxies handling L7 where it's needed.
Ambient moves mTLS and L4 policy into a per-node component, so a pod no longer carries a
sidecar. That mattered more for the migration than for steady state: a workload can join
the mesh without its pod spec changing, which is what made cutting over from ECS without
downtime achievable.

Autoscaling is split by concern. Karpenter provisions nodes against the pods actually
pending, so capacity follows demand without someone maintaining node groups. KEDA scales
workloads on the signal that drives them, which for queue-backed and event-driven game
services is never CPU.

Policy is enforced at admission. Kyverno rejects a missing label or an unsafe setting when
it's submitted, so the cluster can't drift into a state a later sweep has to find and
chase down.

Infrastructure outside the cluster is declared from inside it. Crossplane lets a team
request a managed dependency through the same interface as everything else, with Terraform
staying where it fits.

Secrets, DNS, certificates and observability all follow the same pattern: External
Secrets, ExternalDNS, cert-manager, Datadog. The platform owns the integration and the
team owns a declaration.

## The operating model

I'd put as much weight on this as on the architecture.

I wrote an RFC and ADR process so decisions were argued in writing and stayed findable
afterwards. On a team with an eight-hour spread, a decision made on a call gets
relitigated by whoever wasn't there.

I wrote the service ownership model, setting out what the platform owes product teams and
what those teams own themselves, along with the incident management model that goes with
it. Without that boundary a platform team becomes the escalation point for every problem on
the cluster, which is more work than any size of team absorbs.

## Trade-offs

Ambient mode was newer than the sidecar model when I picked it. The migration argument
won, but it meant taking the less-travelled path through a service mesh that's already a
large piece of machinery.

A platform that abstracts this much is also one more thing to learn. Someone comfortable
with raw Kubernetes has to work through the platform's interface. That cost is real. I took it
because it lands on one team and then stops.

## Results and lessons

Existing services moved from ECS to EKS with no downtime, which was the hard requirement.
The RFC and ADR practice outlasted the projects that prompted it and became how the group
made decisions.

What I'd carry forward: write the ownership model at the same time as the architecture.
The technical design was ready before there was an agreed answer to who gets paged, and
the gap between those two is where a platform team quietly turns into a support desk.
