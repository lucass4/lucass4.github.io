---
title: "Consolidating 38 AWS Accounts Without Losing Cost Visibility"
weight: 3
featured: true
metric: "38 accounts → 6"
metric_note: "attribution enforced at admission"
problem: "Consolidating 38 AWS accounts into six removed the account boundary that per-game cost reporting had been relying on."
role: "Designed the replacement attribution model and the enforcement behind it"
scale: "38 accounts reduced to six shared accounts"
outcome: "Tag coverage enforced at admission: an untagged stateful resource cannot be created"
stack: ["AWS Organizations", "Service Control Policies", "Datadog", "Terraform"]
description: "When 38 AWS accounts became six, physical billing isolation disappeared. The five-tag schema, SCPs and container cost allocation that replaced it."
---

## Context

Fortis ran 38 AWS accounts. Consolidating them into six shared accounts was the right move
operationally, and it had a consequence that's easy to miss until the first invoice: an
account per game is also a cost report per game. The account boundary had been doing
accounting work nobody designed it to do.

Once several games share an account, "what does this game cost" stops having an answer the
billing console can give you.

## Constraints

Per-game margin was a real reporting requirement, not an internal curiosity, so the answer
couldn't be "estimate it."

The replacement had to work on resources that already existed and on everything created
afterwards, by teams who weren't going to enjoy a tagging mandate.

## My role

I wrote the attribution framework and the enforcement model behind it.

## The design

A five-tag schema carries the attribution, so a tagged resource can be traced without a
lookup table living in someone's head. It does not cover everything on the bill: the deny
below applies to stateful resources, so ephemeral work can run untagged, and shared
compute needed its own rule.

Service Control Policies enforce it by denying untagged stateful resources. The common
approach scans for untagged resources and chases
the owners, which leaves the data wrong between the mistake and the sweep, and there's
always somewhere it's wrong. An SCP that refuses to create an untagged stateful resource
keeps bad data out from the start. The cost is that somebody's Terraform plan fails, which
is a much better place to find out.

I scoped the deny to stateful resources deliberately. Applying it to everything would have
blocked ephemeral and experimental work for no accounting benefit, and a guardrail that blocks work for
no visible reason collects exceptions until it stops meaning anything.

Shared compute uses a landlord-and-tenant split, built on Datadog container cost
allocation. Tenants are charged for the pod resources they request. Idle capacity is
charged to my own team.

That last part is the bit worth copying. Socialise unused capacity across tenants and
nobody owns bin-packing efficiency, so it degrades without anyone noticing. Charging it to
the platform team puts the bill with the team that can act on it.

## Trade-offs

Charging for requested resources rather than consumed ones is an approximation, and a team
that over-requests pays for the over-request. I consider that the correct incentive, but it
does mean the numbers are an allocation model and not a measurement, which matters when
finance asks.

Six accounts instead of 38 also means weaker blast-radius isolation. The tagging work
replaced the cost reporting the account boundary had been providing. It doesn't replace the
security boundary, and that was a separate conversation.

## Results and lessons

Attribution survived the consolidation, enforced at admission.

The lesson is that an account structure carries meaning nobody wrote down. Before
collapsing a boundary it's worth asking what work that boundary has quietly been doing.
Billing isolation was never why those 38 accounts existed, and it was still load-bearing by
the time anyone looked.
