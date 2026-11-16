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
stack: ["EKS", "Istio Ambient", "ArgoCD", "Helm", "Karpenter", "KEDA", "Kyverno", "Crossplane", "Terraform"]
description: "Designing a production Kubernetes platform from nothing at Fortis Games: EKS, GitOps, service mesh, autoscaling, policy, and the operating model that made it usable."
---

## Context

Fortis Games was building game studios and had no internal platform. Every team that
needed a service running needed networking, deployment, secrets, monitoring and DNS, and
without somewhere shared to get those, each team would have solved them separately and
differently. I joined as infrastructure technical lead and the platform was the first
thing to design.

The requirement was that a studio team should be able to ship a service without having to
learn how the infrastructure underneath it is wired.

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

{{< architecture svg="kubernetes-platform" label="Platform architecture" caption="Grouped by domain, with every line labelled. Kyverno's accent line is a decision applied to what Argo CD ships; the manifests never route through it. The diagram states responsibilities and relationships, not topology: cluster counts, network layout and addressing are not published." >}}
[Delivery] Git, Argo CD*
-> applies, through admission
[Cluster, on EKS] Kyverno*, Application workloads*, Istio ambient, KEDA, Karpenter, Crossplane*
+[Platform services, in the cluster] External Secrets, ExternalDNS, cert-manager, Datadog (Operator-managed agents)
-> workloads claim, Crossplane manages
[Outside the cluster] AWS resources
!! Terraform :: Runs outside the cluster and provisions the cluster itself and the AWS accounts underneath it. Not something a request passes through.
---
Argo CD reads desired state from Git and applies manifests to the cluster. Kyverno runs
there as an admission webhook on what Argo CD applies, and either admits a workload or
denies it; manifests do not pass through Kyverno on the way in.
KEDA scales workloads on queue depth and event rate, Karpenter adds nodes for pods that
are pending, and Istio in ambient mode connects the workloads with mTLS and L4 policy
per node and L7 at waypoint proxies. The platform services run in the cluster too:
External Secrets, ExternalDNS and cert-manager supply secrets, DNS records and
certificates to the workloads, and Datadog's Operator-managed agents observe them.
Crossplane runs in the cluster as well, and workloads claim managed dependencies through
it; its providers manage the AWS resources outside the cluster. Terraform runs outside
and provisions the cluster itself and the accounts underneath it.
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
workloads on the signal that drives them, which for the queue-backed and event-driven
services I was scaling meant queue depth and event rate were more useful than CPU.

Policy is enforced at admission. Kyverno rejects a missing label or an unsafe setting when
it's submitted, so the cluster can't drift into a state a later sweep has to find and
chase down.

Infrastructure outside the cluster is declared from inside it. Crossplane lets a team
request a managed dependency through the same interface as everything else, with Terraform
staying where it fits.

Secrets, DNS, certificates and observability all follow the same pattern: External
Secrets, ExternalDNS, cert-manager, Datadog. The platform owns the integration and the
team owns a declaration.

## The interface teams use

Everything above is what a team never has to touch. What they do touch is two Helm charts
and a values file each: one chart for shipping a service, one for onboarding a team.

The application chart is generic across workload kinds. A Deployment, a Job and a CronJob
all come out of the same chart, and a team turns on what it needs. The chart renders the
workload, its service and its Istio routing, its scaling through KEDA, and the platform
integrations around it: External Secrets, network policy, a pod disruption budget, RBAC,
volumes, and Datadog logs, metrics and dogstatsd tagging. A team declares the image, the
port, the hostname it answers on and the signal it scales on. How those pieces connect
stays in the templates.

The chart is also deliberately bounded. It renders namespace-scoped, non-privileged
workloads and nothing else, so what a team can express through it already sits inside what
Kyverno admits. Admission is the backstop rather than a step in everyone's day.

Defaults in the chart carry decisions nobody should have to relearn per service. Memory
requests equal memory limits, and CPU is requested without a limit, because a CPU limit on
these workloads buys throttling rather than protection.

The ECS cutovers ran through the chart too. With migration enabled it renders a
ServiceEntry for the existing ECS host and a DestinationRule that terminates TLS to it, so
the ECS service becomes a routable destination inside the mesh and the team's
VirtualService can hold weighted routes to both it and the in-cluster version. Shifting
traffic is an edit to weights in a values file; rolling back is the same edit in reverse.
That is why there was no maintenance window: nothing had to move at once.

Both charts are versioned and published to an internal Helm repository, and each consumer
pins a version. A platform change is a chart release that teams adopt on their own
schedule, not a message asking everyone to go edit their manifests. The application chart
carries its own unit tests and rendered snapshots in CI, which is the cost of templates
every service renders through.

The onboarding chart makes a team a values file. It creates the team's namespaces with the
labels the platform expects, the Argo CD project that scopes what that team can deploy and
where, and the Istio ambient waypoint for each namespace, with sizing and KEDA autoscaling
for the waypoint where a namespace needs it. A team can claim its public entry point there
too: a leaf ingress joined to the shared load balancer group, with one certificate per team
carrying its environment hostnames as subject alternative names.

The part that needed a second pass was what the chart did not cover. Onboarding still meant
hand-editing two shared files, an Argo CD project kept in a central directory and a secret
store's list of permitted namespaces, and a self-service path with a hand-edit left in it
is not self-service. The fix in both cases was to take the shared file out of the path. The
project became a chart template, and the secret store's allowlist of team namespaces became
a denylist of infrastructure ones, which is correct for every team added later without
anyone touching it.

## The operating model

I wrote an RFC and ADR process so decisions were argued in writing and stayed findable
afterwards. On a team with an eight-hour spread, a decision made on a call gets
relitigated by whoever wasn't there.

I wrote the service ownership model, setting out what the platform owes product teams and
what those teams own themselves, along with the incident management model that goes with
it. Without that boundary a platform team becomes the escalation point for every problem on
the cluster, which is more work than any size of team absorbs.

## Trade-offs

Ambient mode was newer than the sidecar model when I picked it. The migration argument
won, but it meant taking the less common path through a service mesh that's already a
large piece of machinery.

A platform that abstracts this much is also one more thing to learn. Someone comfortable
with raw Kubernetes has to work through the platform's interface. That cost is real. I took it
because it lands on one team and then stops.

A shared chart is a shared dependency. Every service renders through the same templates, so
a regression in them is not one team's problem, and a team with a genuinely unusual
requirement either gets the chart extended or ends up outside it. Keeping it general
without letting it turn into a configuration language of its own is continuous work.

## Results and lessons

Existing services moved from ECS to EKS with no downtime, which was the hard requirement.
The RFC and ADR practice outlasted the projects that prompted it and became how the group
made decisions.

What I'd carry forward: write the ownership model at the same time as the architecture.
The technical design was ready before there was an agreed answer to who gets paged.
