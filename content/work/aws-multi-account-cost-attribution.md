---
title: "Cutting AWS Accounts by Over 80% Without Losing Cost Visibility"
weight: 3
metric: "Over 80% fewer"
metric_note: "AWS accounts, with cost allocation preserved"
problem: "Cutting the AWS account count by over 80% removed the account boundary that per-game cost reporting had been relying on."
role: "Designed the replacement attribution model and the enforcement behind it"
scale: "AWS account count reduced by over 80%, into shared accounts"
outcome: "Existing resources audited and tagged; creation-time tagging controls applied to covered stateful-resource APIs"
stack: ["AWS Organizations", "Service Control Policies", "Datadog", "Terraform"]
description: "When the AWS account count fell by over 80%, physical billing isolation disappeared. The five-tag schema, SCPs and container cost allocation that replaced it."
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

A five-tag schema carries the attribution, so a tagged resource can be traced without a
lookup table living in someone's head. It does not cover everything on the bill: the deny
below applies to stateful resources, so ephemeral work can run untagged, and shared
compute needed its own rule.

We first audited existing resources, used that report to run a campaign to tag them, and
then applied Service Control Policies to require tags at creation for the covered
stateful-resource operations. The common
approach scans for untagged resources and chases the owners, which leaves the data wrong
between the mistake and the sweep, and there's always somewhere it's wrong. A
creation-time deny on the supported APIs stops the same class of omissions from recurring.
The cost is that somebody's Terraform plan fails, which
is a much better place to find out.

I scoped the deny to stateful resources deliberately. Applying it to everything would have
blocked ephemeral and experimental work for no accounting benefit, and a guardrail that
blocks work for no visible reason collects exceptions until it stops meaning anything.

Shared compute uses a landlord-and-tenant split, built on Datadog container cost
allocation. Tenants are charged for the pod resources they request. Idle capacity is
charged to my own team.

Socialise unused capacity across tenants and nobody owns bin-packing efficiency, so it
degrades without anyone noticing. Charging it to the platform team puts the bill with the
team that can act on it.

## Trade-offs

Charging for requested resources instead of consumed ones is an approximation, and a team
that over-requests pays for the over-request. I consider that the correct incentive.
Tagged resources are attributed from the bill directly. Shared compute is allocated by a
stated rule, so every charge traces to a pod's requests and can be audited, but it is not
metered usage, and anyone reading the figures needs to know which came from which.

Fewer accounts also means weaker blast-radius isolation. The tagging work replaced the
cost reporting the account boundary had been providing. It doesn't replace the security
boundary.

## Results and lessons

Attribution survived the consolidation through an audit-and-tag campaign for existing
resources, followed by creation-time controls on covered APIs.

We hadn't documented all the functions those account boundaries served. Billing isolation
was never why the original accounts existed, and it was still load-bearing by the time
anyone looked.