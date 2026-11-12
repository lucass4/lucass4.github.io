---
title: "One Engineer Takes the Interrupts So Seven Can Build"
draft: true
weight: 4
featured: true
metric: "1 week in 8"
metric_note: "every engineer rotates through every area"
problem: "Infrastructure requests, alerts and dependency upgrades arrived continuously and landed on whoever saw them first, so project work was interrupted constantly and each area's knowledge stayed with its specialist."
role: "Designed the rotation and wrote the process"
scale: "Eight engineers, four countries, every Infrastructure-owned repository"
outcome: "Interrupts have one owner per week; the other seven keep their project time, and everyone passes through every area in turn"
stack: ["Argo CD", "Renovate", "ClickUp", "Slack", "Kanban"]
description: "A weekly support engineer rotation at Fortis Games: one person absorbs requests, alerts and dependency upgrades, which protects everyone else's project time and spreads knowledge across every area of the platform."
---

> Draft. Written from the team's own process document. Three things need checking before
> this publishes; they are at the end.

## Context

A platform team gets interrupted for a living. Requests for access, a service behaving
oddly, an alert firing, a dependency upgrade waiting on review. None of it is optional and
none of it is the project anyone is supposed to be working on this quarter.

Handled the obvious way, that work lands on whoever happens to see the message. The cost
shows up twice. Project work gets fragmented, because an engineer who might be interrupted
cannot plan a day around deep work. And the interrupts route themselves to whoever is known
to answer them, which means they always reach the same person.

The second cost was sharper for us than the first. The team was organised around four areas
with a lead each: CI/CD, SRE, platform, AI infrastructure. Specialisation is why that
structure works, and it is also how an area becomes one person's private knowledge. When
every CI/CD question goes to the CI/CD people, nobody else ever learns CI/CD.

## Constraints

Requests still had to be answered the same day. Pushing them into a backlog groomed next
sprint turns a working platform into a ticket queue. The team also spanned four countries,
so nothing could depend on everyone being online at once.

A dedicated support person was the obvious answer and the wrong one. A permanent support
role fixes the interruption problem by making one engineer absorb it forever, which solves
the focus half and makes the knowledge half worse.

## My role

I designed the rotation and wrote the process.

## The design

One engineer per week, Monday to Friday, working hours. The week is named in advance and
the roster order is fixed, so everyone knows when their turn is coming and who holds it
now.

This is not on-call. Incidents and after-hours paging are a separate process with its own
escalation path. The support rotation deliberately has no after-hours component, because
its job is absorbing the daytime stream, and bundling the two would have made a week of
support indistinguishable from a week of being on call.

The week has four claims on it, in a fixed order:

{{< stack label="What the support week covers" caption="Taken from the team's support engineer process. The priority order is part of the design, not a guideline." >}}
Requests :: Acknowledged, prioritised, followed up until closed or handed over :: first priority
Monitoring and Argo CD :: Alerts and sync or health failures, fixed at the cause :: first priority
Renovate :: Dependency PRs across every Infrastructure-owned repository, oldest first :: second priority
Project work :: Anything from the Kanban board, any size, pausable :: third priority
{{< /stack >}}

The ladder is written down because without it the support engineer optimises for whatever
is loudest.

Project work is explicitly allowed to be large. The constraint is that it has to be
pausable, not that it has to be small. A support week that forbids real work produces a
week of busy-waiting, and that is capacity the team planned for and did not get.

## Making requests visible

A request in a chat channel is a message that scrolls. Reacting to it with an envelope
emoji creates a tracked task automatically, so the cost of capturing a request is one
reaction and there is nothing a requester has to learn.

The support engineer coordinates it through to completion even when somebody else
implements the fix. Ownership follows the request, not the implementation, which is what
stops a handed-off request from quietly becoming nobody's.

## No broken windows

For alerts and Argo CD failures the rule is explicit: do not let recurring failures or
noisy alerts become something the team learns to ignore.

That means fixing the underlying cause, and it also means editing the monitor when the
monitor is what is wrong. A monitor that cries wolf is worse than no
monitor, because it trains everyone to scroll past the channel where the real one will
appear.

If something cannot be fixed inside the week, it gets documented and given an owner.
Unfixable-this-week is an acceptable outcome; unowned is not.

## Friday handoff

The handoff happens in the Friday team meeting, which already existed. It did not need a
new meeting, and putting it in front of the whole team makes the week's state common
knowledge, not a private briefing between two people.

The outgoing engineer covers open requests and blockers, unresolved alerts and Argo CD
failures, Renovate PRs still needing attention, and anything else the next engineer should
know. Tasks are updated before the meeting, so the handoff is a conversation about state and not an
attempt to reconstruct it.

## What it did

The direct effect is the one it was designed for. Seven engineers get a week where
interrupts are somebody else's job, which makes a planned week actually plannable.

The effect I did not design for is the one I would talk about now. Every engineer passes
through every area, roughly a week in eight. The SRE specialist spends a week merging CI/CD
dependency upgrades. The CI/CD specialist spends a week inside Argo CD sync failures.
Nobody gets to route an area's questions permanently to the person who owns that area,
because in eight weeks they will be answering them personally.

That did more for cross-area knowledge than any documentation effort I ran. Writing things
down helps the person who already knows where to look. A rotation makes people look.

## Trade-offs

One engineer in eight on support is around twelve percent of capacity spent on work that
never appears on a roadmap. That cost was always being paid, spread invisibly across
everyone, where it could not be planned around or measured.

A specialist having a slow week in someone else's area is also a real cost. Requests take
longer to resolve while the person holding them is learning. That is tuition, and it is
also the mechanism.

Weekly is long enough to see something through and short enough that the turn comes round
often. Shorter would add handoffs, which is where state goes missing.

## What I would do differently

Measure it. I can describe what the rotation changed and I cannot show it, because nothing
was instrumented before or after. Request volume and time to acknowledge were both
available and neither was tracked, which makes the strongest claim here the one I can least
support.

## Open before this publishes

1. **Numbers.** Anything measured before or after: request volume, time to acknowledge,
   Renovate backlog depth, interrupts reaching non-support engineers.
2. **Rotation size.** Eight is what the roster showed. Eight throughout, or did it grow?
3. **Attribution.** Is the process document yours alone, or written with the area leads?
