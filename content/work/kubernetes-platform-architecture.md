---
title: "Kubernetes Platform Architecture"
date: 2026-01-15
weight: 1
featured: true
problem: "A game company with no internal platform needed one that studio teams could ship on without each team rebuilding infrastructure from scratch."
role: "Designed the architecture end to end, then led the function that ran it"
scale: "Multiple game studios, teams across four countries"
outcome: "Zero-downtime cutovers from ECS to EKS; a documented decision process that outlived individual projects"
stack: ["EKS", "Istio Ambient", "ArgoCD", "Karpenter", "KEDA", "Kyverno", "Crossplane", "Terraform"]
description: "Designing a production Kubernetes platform from nothing at Fortis Games: EKS, GitOps, service mesh, autoscaling, policy, and the operating model that made it usable."
---

## Context

Fortis Games was building game studios and had no internal platform. Every team that
needed a service running needed networking, deployment, secrets, monitoring and DNS,
and without somewhere shared to get those, each team would have solved them separately
and differently. I joined as infrastructure technical lead and the platform was the
first thing to design.

The requirement was not "run Kubernetes." It was that a studio team should be able to
ship a service without having to learn how the infrastructure underneath it is wired.

## Constraints

The engineering team was distributed across Brazil, Portugal, England and Canada, an
eight-hour spread. Nothing could require everyone to be awake at the same time, which
rules out a platform that depends on tribal knowledge or on asking me.

Workloads were already running on ECS. The platform had to be somewhere existing
services could move to without a maintenance window, because game traffic does not have
a convenient quiet hour.

## My role

I designed the architecture: networking, GitOps, autoscaling, service mesh, secrets,
policy, observability, DNS and ingress. After being promoted to run DevOps Engineering
I kept platform architecture and technical direction while the function grew to four
area leaders, covering CI/CD, SRE, platform and AI infrastructure.

## Architecture and decisions

The platform is EKS with each layer chosen to be something a product team never has to
think about.

**Delivery is GitOps.** ArgoCD reconciles cluster state from Git, so the cluster's
contents are reviewable and a rollback is a revert. The alternative, letting CI push
with cluster credentials, puts production write access into every pipeline and leaves no
single description of what is supposed to be running.

**The mesh is Istio in ambient mode, with waypoint proxies for L7.** Ambient moves
mTLS and L4 policy into a per-node component instead of a sidecar in every pod, and
waypoints handle the L7 work only where it is needed. This mattered more for migration
than for steady state: a workload can join the mesh without its pod spec changing, which
is what made cutting over from ECS without downtime achievable.

**Autoscaling is split by concern.** Karpenter provisions nodes against actual pending
pods rather than fixed node groups. KEDA scales workloads on the signal that drives
them, which for queue-backed and event-driven game services is not CPU.

**Policy is admission-time.** Kyverno enforces the rules, so a missing label or an
unsafe setting is rejected when it is submitted instead of being found later by a
sweep. Guardrails that run at submission are the only ones that stay true.

**Infrastructure outside the cluster is declared from inside it.** Crossplane lets a
team request a managed dependency through the same interface as everything else, with
Terraform remaining where it fits.

Secrets, DNS, certificates and observability are all pulled in the same direction:
External Secrets, ExternalDNS, cert-manager, Datadog. The pattern is that the platform
owns the integration and the team owns a declaration.

## The operating model

The part I would argue hardest for is not in the diagram.

I wrote an RFC and ADR process so that decisions were argued in writing and stayed
findable afterwards. On a team with an eight-hour spread, a decision that lives in a
call is a decision that gets relitigated.

I wrote the service ownership model, setting out what the platform owes product teams
and what those teams own themselves, and the incident management model that goes with
it. Without that boundary, a platform team becomes the place every problem is escalated
to, which does not scale and does not teach anyone anything.

## Trade-offs

Ambient mode was newer than the sidecar model when I picked it. The migration argument
won, but it meant adopting the less-travelled path in a service mesh that is already a
large piece of machinery.

A platform that abstracts this much is one more thing to learn. Someone comfortable with
raw Kubernetes has to go through the platform's interface instead. That cost is real;
the return is that the other teams never pay it.

## Results and lessons

Existing services moved from ECS to EKS with no downtime, which was the hard
requirement. The RFC and ADR practice survived individual projects and became how the
group made decisions.

What I would carry forward: write the ownership model at the same time as the
architecture, not after. The technical design was ready before there was an agreed
answer to who gets paged, and the gap between those two is where a platform team
quietly becomes a support desk.
