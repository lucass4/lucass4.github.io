---
title: "Building a DevOps Engineering Function"
weight: 1
metric: "10 engineers"
metric_note: "four areas, four countries"
problem: "The company had no platform function. I joined as infrastructure technical lead to build the platform, and the engineering function that would own it had to be built alongside it."
role: "Built the function, managed ten engineers, introduced the operating model and began the transition to four domain leads"
scale: "Ten engineers across four countries, an eight-hour spread"
outcome: "Ten engineers across four areas; written decision and ownership processes adopted while the domain-lead transition was under way"
stack: ["RFC", "ADR", "Service ownership model", "Incident management", "Kanban"]
description: "Building and then leading DevOps Engineering at a game company: how the function grew to ten engineers, and the decision processes that let it run without routing through me."
---

## What was there when I joined

I joined as Principal Software Engineer and Infrastructure Technical Lead. There was no
internal platform.

Designing one was the first job, and the architecture is
[its own case study](/work/kubernetes-platform-architecture/). This page is about the other
half: the engineering function that had to exist to own the platform once it was running.

## The function grew before the title did

A platform creates operational ownership that doesn't end. Clusters to keep running, a
delivery pipeline, dependency upgrades, alerts, and a continuous stream of requests from
studio teams. That work arrives whether or not anyone has been made responsible for it.

Areas formed around it as it grew: CI for games, AI infrastructure, SRE and
platform/compute. Each one is
work that someone has to hold by default rather than when asked.

I was setting the function's technical direction well before I had a management title.
That caught up when I became Sr. Manager, DevOps Engineering. The title changed
what I was accountable for. It did not change what the team did that week.

## Four areas, leadership in transition

The team reached ten engineers across CI for games, AI infrastructure, SRE and
platform/compute. I was moving toward one hands-on domain lead per area, with technical
authority delegated closer to the work. This reorganisation was still in progress; I would
not describe all four leads as fully established.

The team sits in four countries, an eight-hour spread. Almost nothing can depend on
everyone being awake at once, and that rules out two ways of running a team.

The first is the decision made live. The window where all four countries are working is too
narrow to hold a function's technical decisions, and the people it excludes are the ones who
have to live with them.

The second is me as the approver. If a lead needs my sign-off to proceed, an engineer in
Europe spends the afternoon blocked on a morning that hasn't started in Canada yet.
Routing decisions through one person is a bottleneck on any team; on this one it is also an
eight-hour delay.

## Delegating decisions, not tasks

Delegating tasks is easy and it solves neither problem. What unblocks an engineer eight
hours
away is delegating the decision, and a decision can only be delegated if there is something
to decide against.

I have a specific reason to care about this. Earlier in my career I went deep enough on
problems that I became part of the critical path, and the processes here are partly a
correction for that.

There are three of them, and each settles a different question. I wrote the RFC and ADR
process, which settles where a technical argument happens: in writing, so the reasoning
survives after the people in it have moved on to something else. I wrote the service
ownership model, which settles what platform owes product teams and what those teams own
themselves. And I wrote the incident management model that goes with it, which settles who
holds an incident while it's open.

All three were designed to let engineers make decisions without waiting for me.

## Operations against projects

Projects and operations compete for the same engineers, and operations wins that competition
by default, because it's the half that makes noise.

The support rotation is how we settled it: I designed, wrote and rolled out a weekly turn in
which one engineer holds requests, alerts and dependency upgrades in a fixed priority order,
requests first and project work last.

At ten engineers that reserves roughly ten percent of the roster for operational work
first; when the roster had eight it was one in eight. The support engineer still takes
project work once requests and alerts are handled. The team was already paying that cost
through scattered interruptions before the rotation made it something we could plan
around. The design and the trade-offs are in
[its own case study](/leadership/support-engineering-rotation/).

## Managing engineers before this role

This is not where I first led a team. As Team Leader at an earlier company I managed nine
distributed engineers through a migration onto AWS and Kubernetes. That was people
management.

Later, as Staff Platform Systems Engineer, I was technical lead for four engineers. That
was technical leadership and not people management, and the distinction is worth keeping:
I was accountable for the technical direction of that work, not for the engineers
themselves.

## What I would do differently

Measure the operating model. I can describe what changed, and that's all I can do. The
intended autonomy of the domain leads was not fully realised before the reorganisation
ended. The written decision process was in use, but I did not measure time saved by it.

The rotation is the clearest case, because the measurements were sitting there. The teams
filing requests were happier with us afterwards, which is what I observed and what they told
me, and I can't show it. I tracked the number of open support requests each week and moved
recurring issues into the backlog for longer-term toil reduction. New request arrivals,
time to acknowledge and formal requester satisfaction were never tracked.

The pattern I'd break is treating a process as finished once it was adopted. Instrumenting
one is cheap next to writing it, and without it the only defence of a process is a
description of the process.
