---
title: "Cutting AWS Accounts by Over 80% Without Losing Cost Visibility"
weight: 3
metric: "Over 80% fewer"
metric_note: "AWS accounts, with cost allocation preserved"
problem: "Cutting the AWS account count by over 80% removed the account boundary that per-game cost reporting had been relying on."
role: "Designed the replacement attribution model and the enforcement behind it"
scale: "AWS account count reduced by over 80%, into shared accounts"
outcome: "Existing resources audited and tagged; tagging enforced at creation, scoped so it does not block experimental work"
stack: ["AWS Organizations", "Service Control Policies", "Datadog", "Terraform"]
description: "When the AWS account count fell by over 80%, physical billing isolation disappeared. The tagging schema, creation-time enforcement and shared-compute allocation that replaced it."
---

## Context

Consolidating the company's AWS accounts into shared ones cut their number by over 80%. It
was the right move operationally, and it had a consequence that's easy to miss until the
first invoice: an account per game is also a cost report per game. The account boundary
had been doing accounting work nobody designed it to do.

Once several games share an account, "what does this game cost" stops having an answer the
billing console can give you.

## Constraints

Cost per game had to stay reportable, and the figures had to trace back to resources, not
to estimates.

The replacement had to address resources that already existed as well as new resources
created afterwards, by teams who were not going to enjoy a tagging mandate.

## My role

I wrote the attribution framework and the enforcement model behind it.

## The design

A tagging schema carries the attribution, so a tagged resource can be traced without a
lookup table living in someone's head. Tags alone don't cover everything on the bill, so
enforcement and shared compute each needed their own decision.

We first audited existing resources, used that report to run a campaign to tag them, and
then applied Service Control Policies to require tags when resources are created. The
common approach scans for untagged resources and chases the owners, which leaves the data
wrong between the mistake and the sweep, and there's always somewhere it's wrong. A
creation-time deny stops the same class of omissions from recurring. The cost is that
somebody's Terraform plan fails, which is a much better place to find out.

I scoped the enforcement deliberately. Applying it to everything would have blocked
experimental work for no accounting benefit, and a guardrail that blocks work for no
visible reason collects exceptions until it stops meaning anything.

Shared compute is allocated by an explicit rule, built on Datadog container cost
allocation. I designed the rule so that the cost of unused capacity lands with the team
that can reduce it. Spread that cost across every team and nobody owns bin-packing
efficiency, so it degrades without anyone noticing.

## Trade-offs

Allocating shared compute by rule is an approximation. I chose the rule for the incentive
it creates. Tagged resources are attributed from the bill directly. Shared-compute figures
are allocations that can be audited against the rule, not metered usage, and anyone
reading the figures needs to know which came from which.

Fewer accounts also means weaker blast-radius isolation. The tagging work replaced the
cost reporting the account boundary had been providing. It doesn't replace the security
boundary.

## Results and lessons

Attribution survived the consolidation through an audit-and-tag campaign for existing
resources, followed by creation-time enforcement.

We hadn't documented all the functions those account boundaries served. Billing isolation
was never why the original accounts existed, and it was still load-bearing by the time
anyone looked.