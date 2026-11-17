---
title: "Platform Reliability and Cost at an Education Technology Company"
draft: true
weight: 2
metric: "35% lower"
metric_note: "cloud infrastructure cost"
problem: "A learning platform with as many as 200,000 concurrent players on peak days, where capacity, delivery and cost all needed owners."
role: "Owned platform architecture, reliability and cost across two periods on the team"
scale: "Up to 200,000 concurrent players on peak days (AWS case study)"
outcome: "Cloud infrastructure cost down 35%, node provisioning moved to Karpenter with an upstream contribution, deployments moved off Flux v1 to Argo CD with no downtime"
stack: ["EKS", "Karpenter", "Argo CD", "Flux", "AWS"]
description: "Platform work at an education technology company: the Karpenter migration and what it did to cost, moving delivery from Flux v1 to Argo CD without downtime, and holding reliability at peak."
---

> **Not publishable yet.** The structure below is the argument and the prose is what I can
> write from the confirmed record, which today is the About page and the timeline. The
> blockquoted questions are the parts only you can answer, one or two sentences each.
>
> Keep out of it: cluster names, account identifiers, repository paths, internal service
> names, and anything about students or customer data.

## Context

The company runs a learning platform with [as many as 200,000 concurrent players on peak
days](https://aws.amazon.com/solutions/case-studies/prodigy-education-eks-case-study/),
per the AWS case study on the Karpenter migration I led, published after I left. I worked
on it across two periods, first as Senior DevOps Engineer and later as Principal Software
Developer, SRE. Platform architecture, reliability and cost were mine.

> **Needed:** what the platform ran on, and what shape the problem took when each of the
> two periods started. One specific pressure or failure per period is enough, and it is
> what makes the rest of the page read as work instead of a list of technologies.

> **Needed:** whether you were leading others in either period or working as an individual
> contributor. This page is evidence for principal-level scope, so the distinction matters
> and the site already draws it carefully elsewhere.

## Capacity: moving node provisioning to Karpenter

I led the Karpenter migration and contributed upstream along the way.

> **Needed:** what provisioned nodes before this, and the specific thing it could not do.
> Managed node groups and cluster-autoscaler both have a known failure shape at this scale;
> naming which one you had, and what it did at peak, is the whole argument for the move.

> **Needed:** what the upstream contribution was. A feature, a fix, or a provider gap, and
> roughly what it addressed. One sentence, no link required.

> **Partly answered:** Spot was central to the cost work. Workload safeguards included
> topology spreading, node affinity, disruption budgets and resource-sizing changes. Still
> needed: the specific node-provisioning transition and interruption behavior during a
> real Spot reclaim.

## Cost: a 35% reduction

Cloud infrastructure cost came down 35%, primarily by moving compute from On-Demand to
Spot. That took more than changing an instance type: we prepared workloads for
interruption through topology spread constraints, node affinity and pod disruption
budgets; right-sized services; and aligned memory requests and limits where predictable
scheduling and safe termination mattered.

> **Needed:** what that 35% is measured against, and over what period. A percentage with no
> baseline is the one number a reader discounts.

> **Confirmed:** the dominant driver was moving compute from On-Demand to Spot; additional
> work included resource sizing, memory requests and limits, topology spreading, node
> affinity and disruption budgets. Do not attribute the entire 35% to Karpenter without
> separately confirming the timing and baseline.

## Delivery: Flux v1 to Argo CD

Deployments moved from Flux v1 to Argo CD with no downtime.

> **Needed:** why the move happened. Flux v1 reaching end of life, or a capability you
> needed that it did not have.

> **Needed:** roughly how many services and clusters moved, and the mechanism that kept
> the cutover from causing downtime. The Kubernetes platform case study makes the same
> kind of claim and earns it by naming the mechanism, so this one should too.

## Reliability at peak

> **Needed:** what happened at peak load, what you changed, and whether a before and after
> survives for error rate, latency, or incident count. If no numbers survive, say so and
> the page will state it plainly, which is what the other case studies do.

## Trade-offs

> **Needed:** what the Karpenter model cost. Interruption handling, consolidation churn, or
> capacity shortfalls at peak are the common ones. Also whether Argo CD added anything the
> team had to learn.

## What I'd carry forward

> **Needed:** one lesson, one sentence.
