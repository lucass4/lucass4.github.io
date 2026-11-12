---
title: "Consolidating 38 AWS Accounts Without Losing Cost Visibility"
date: 2026-03-10
weight: 3
featured: true
problem: "Consolidating 38 AWS accounts into six removed the account boundary that per-game cost reporting had been relying on."
role: "Designed the replacement attribution model and the enforcement behind it"
scale: "38 accounts reduced to six shared accounts"
outcome: "Tag coverage enforced at admission by policy rather than reconciled by cleanup scripts"
stack: ["AWS Organizations", "Service Control Policies", "Datadog", "Terraform"]
description: "When 38 AWS accounts became six, physical billing isolation disappeared. The five-tag schema, SCPs and container cost allocation that replaced it."
---

## Context

Fortis ran 38 AWS accounts. Consolidating them into six shared accounts was the right
move operationally, and it had a consequence that is easy to miss until the first
invoice: an account per game is also a cost report per game. The account boundary had
been doing accounting work nobody had designed it to do.

Once several games share an account, "what does this game cost" stops having an answer
the billing console can give you.

## Constraints

Per-game margin was a real reporting requirement, not an internal curiosity, so the
answer could not be "estimate it."

The replacement had to work on resources that already existed and on everything created
afterwards, by teams who were not going to enjoy a tagging mandate.

## My role

I wrote the attribution framework and the enforcement model behind it.

## The design

**A five-tag schema**, so that every cost line can be attributed without a lookup table
living in someone's head.

**Enforced by Service Control Policies that deny untagged stateful resources.** This is
the decision I would defend hardest. The common approach is to scan for untagged
resources and chase the owners, which means the data is wrong between the mistake and
the sweep, and it is always wrong somewhere. An SCP that refuses to create an untagged
stateful resource means bad data cannot enter in the first place. The cost is that
somebody's Terraform plan fails, which is a far better place to find out.

I scoped the deny to stateful resources deliberately. Applying it to everything would
have blocked ephemeral and experimental work for no accounting benefit, and a guardrail
that gets in the way without a reason is a guardrail that gets an exception carved into
it.

**A landlord-and-tenant split for shared compute**, using Datadog container cost
allocation. Tenants are charged for the pod resources they request. Idle capacity is
charged to my own team, not spread across tenants.

That last part is the bit worth copying. If unused capacity is socialised across
tenants, nobody owns bin-packing efficiency and it quietly degrades. Charging it to the
platform team gives the inefficiency an owner who can actually fix it, and the team
holding the bill is the team with the ability to act on it.

## Trade-offs

Requested resources, not consumed resources, is an approximation. A team that
over-requests pays for the over-request. I consider that the correct incentive rather
than a flaw, but it does mean the numbers are an allocation model and not a measurement,
and saying so matters when finance asks.

Six accounts instead of 38 also means weaker blast-radius isolation. The tagging work
replaced the cost reporting that the account boundary had been providing; it does not
replace the security boundary, and that is a separate conversation.

## Results and lessons

Attribution survived the consolidation, enforced at admission rather than reconciled
afterwards.

The lesson is that an account structure carries meaning that is not written down
anywhere. Before collapsing a boundary it is worth asking what work that boundary has
quietly been doing, because billing isolation was never the reason those 38 accounts
existed, and it was still load-bearing by the time anyone looked.
