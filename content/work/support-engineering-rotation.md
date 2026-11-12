---
title: "Building a Weekly Infrastructure Support Rotation"
weight: 4
featured: true
metric: "1 week in 10"
metric_note: "every engineer rotates through every area"
problem: "Infrastructure requests, alerts and dependency upgrades arrived continuously and landed on whoever saw them first, so project work was interrupted constantly and each area's knowledge stayed with its specialist."
role: "Designed it, wrote the process, implemented it and rolled it out"
scale: "Grew to ten engineers across four countries, every Infrastructure-owned repository"
outcome: "Interrupts have one owner per week; the other nine keep their project time, and everyone passes through every area in turn"
stack: ["Argo CD", "Renovate", "ClickUp", "Slack", "Kanban"]
description: "A weekly support engineer rotation at Fortis Games: one person absorbs requests, alerts and dependency upgrades, which protects everyone else's project time and spreads knowledge across every area of the platform."
---

## Context

A platform team fields a continuous stream of small work. Requests for access, a service
behaving oddly, an alert firing, a dependency upgrade waiting on review. None of it is
optional and none of it is the project anyone is meant to be working on this quarter.

Left alone, that work lands on whoever sees the message first, and it costs twice. An
engineer who might be interrupted can't plan a day around deep work. And interrupts route
themselves to whoever is known to answer them, so they keep reaching the same person.

The second cost was the sharper one for us. The team was organised around four areas with a
lead each: CI/CD, SRE, platform, AI infrastructure. Specialisation is why that works, and
it's also how an area becomes one person's private knowledge. When every CI/CD question
goes to the CI/CD people, nobody else learns CI/CD.

## Constraints

Requests still had to be answered the same day. Pushing them into a backlog groomed next
sprint leaves the people who filed them waiting on a platform that's meant to unblock them.

The team spanned four countries, so nothing could depend on everyone being online at once.

A dedicated support person would have solved the interruption problem and made the
knowledge problem worse, by giving one engineer the interrupts permanently.

## My role

I designed the rotation, wrote the process, implemented it and rolled it out. The roster
started at eight engineers and grew to ten.

## The design

One engineer per week, Monday to Friday, working hours. The week is named in advance and
the roster order is fixed, so everyone knows when their turn is coming and who holds it
now.

This isn't on-call. Incidents and after-hours paging are a separate process with their own
escalation path. The support rotation has no after-hours component by design, because its
job is the daytime stream, and bundling the two would have made a support week
indistinguishable from an on-call week.

The week has four claims on it, in a fixed order:

{{< stack label="What the support week covers" caption="Taken from the team's support engineer process. The priority order is part of the design, not a guideline." >}}
Requests :: Acknowledged, prioritised, followed up until closed or handed over :: first priority
Monitoring and Argo CD :: Alerts and sync or health failures, fixed at the cause :: first priority
Renovate :: Dependency PRs across every Infrastructure-owned repository, oldest first :: second priority
Project work :: Anything from the Kanban board, any size, pausable :: third priority
{{< /stack >}}

The order is written down because an undirected support engineer will work on whichever
thing is making the most noise, and that isn't reliably the thing that matters most.

Project work is explicitly allowed to be large. The constraint is that it has to be
pausable, not that it has to be small. If the week forbids real work, the team loses
capacity it had planned for.

## One channel, and a ticket behind every message

Requests arrive in a single operations channel. A request in a chat channel isn't tracked,
so reacting to it with an envelope emoji creates a tracked task automatically. Capturing a
request costs one reaction, and there's nothing a requester has to learn.

The channel is also where the people who filed the requests find out what's happening to
them, so keeping requesters informed of progress and blockers is written into the role, and
the ticket gives those updates somewhere to live.

The support engineer coordinates each request to completion even when somebody else
implements the fix. Ownership follows the request and not the implementation, so one that
gets handed off still has someone answerable for it.

## No broken windows

For alerts and Argo CD failures the rule is explicit: don't let recurring failures or noisy
alerts become something the team learns to ignore.

That means fixing the underlying cause, and it also means editing the monitor when the
monitor is what's wrong. A monitor that fires on nothing teaches people to skim the channel
where the real alert is going to arrive.

If something can't be fixed inside the week, it gets documented and given an owner.

## Friday handoff

The handoff happens in the Friday team meeting, which already existed. It didn't need a new
meeting, and doing it in front of the whole team makes the week's state common knowledge.

The outgoing engineer covers open requests and blockers, unresolved alerts and Argo CD
failures, Renovate PRs still needing attention, and anything else the next engineer should
know. Tasks are updated before the meeting, so the handoff is a conversation about state
and not an attempt to reconstruct it.

## What it did

Nine engineers get a week where interrupts are somebody else's job.

The second effect wasn't something I designed for, and it's the one I'd point at now. Every
engineer passes through every area, roughly a week in ten. The SRE specialist spends a
week merging CI/CD dependency upgrades. The CI/CD specialist spends a week inside Argo CD
sync failures. Nobody can route an area's questions permanently to the person who owns that
area, because within a couple of months they'll be answering them.

It moved more knowledge between areas than the documentation work I ran, because it put
people inside areas they wouldn't have picked.

The teams filing requests were happier with us afterwards. I never measured that, so it's
what I observed and what they told me, not a number I can show. What I'd point to as the
likely cause is the part that was visible to them: a named person each week, a ticket
behind every request, and somebody whose job that week included telling them where their
request had got to.

## Trade-offs

One engineer in ten on support is around ten percent of capacity going to work that never
appears on a roadmap. That cost was already being paid, spread across everyone, where it
couldn't be planned around or measured.

A specialist having a slow week in somebody else's area is a real cost too. Requests take
longer to resolve while the person holding them is learning, and that's part of how the
knowledge moves.

A week is long enough to see something through and short enough that the turn comes round
often. Shorter shifts would add handoffs, and every handoff is a chance to drop context.

## Where I was taking it next

The rotation gives interrupts an owner. It doesn't reduce how many arrive, and a good share
of them are alerts needing the same first twenty minutes of investigation every time.

My last piece of work at Fortis was a proof-of-concept evaluation of kagent, which runs
agents as Kubernetes resources with sandboxed execution. The fit here is what interested
me: an agent that picks up an alert, gathers the context a human would gather and attaches
it to the ticket changes what the support engineer starts from. The propose-and-approve
boundary from the Slack provisioning agent applies, because triage that writes to a cluster
on its own is a much worse idea.

That stayed a proof of concept, so this is a direction I'd started on and not a result.

## What I would do differently

Measure it. I can describe what the rotation changed and I can't show it. Request volume
and time to acknowledge were both available and neither was tracked, and the satisfaction
improvement above is exactly the kind of claim that needed a number.
