---
title: "Approaching a Cluster and a Team the Same Way"
date: 2026-11-16
tags: ["systems thinking", "engineering management", "platform engineering"]
description: "A cluster drifting into bad states and a team losing its project time to interrupts turned out to be the same problem. What Donella Meadows and the engineer/manager pendulum have to do with how I fixed both."
---

A Kubernetes cluster will accept almost anything you hand it. A workload missing the label
that routes its logs. A pod asking for privileges it has no use for. A deployment with no
disruption budget, so the next node drain takes it down. Each one gets admitted, runs, and
becomes something a person has to find later and chase down.

A platform team gets a stream of small work that behaves the same way. Access requests, a
service acting oddly, an alert firing, a dependency upgrade waiting on review. It arrives
all week and lands on whoever sees it first. Everyone gets interrupted a little, no
project moves very far, and each area's knowledge stays with whoever happened to answer.

My first move on both was the same, and it was wrong. Write it down and ask people to be
careful. A document listing the labels a workload needs. An understanding that we would
try not to grab requests out of turn. Both aim at the person making the mistake, and
neither touches what is producing it.

What worked was changing where the work enters.

On the cluster, [Kyverno](/work/kubernetes-platform-architecture/) runs as an admission
webhook. A workload missing a required label is rejected when it is submitted, so the
cluster never holds that state and nobody has to go looking for it. On the team, one
engineer holds the week. Requests, alerts and dependency upgrades go to the
[support engineer on rotation](/leadership/support-engineering-rotation/), in that priority
order, and the other nine keep their project time. That is one week in ten per person, and
everybody passes through every area in turn.

## Where the habit comes from

I got the habit of seeing those as the same move from Donella Meadows. *Thinking in
Systems* makes two claims I use constantly. Behaviour comes out of structure, so a system
that keeps producing a result is a system arranged to produce it. And the leverage of an
intervention depends on where you put it, with the place the symptom shows up being one of
the weakest.

Both problems above were steady behaviour from an arrangement that allowed them. Nobody on
either side was being careless.

Charity Majors calls the career version of this the
[engineer/manager pendulum](https://charity.wtf/p/the-engineer-manager-pendulum): swinging
between building and managing across a career, with the argument that the best frontline
managers are never far from hands-on work and the strongest individual contributors have
done time managing. I have swung three times. Nine engineers at ChatFood in 2020, back to
technical lead at Wrapbook in 2022, principal engineer and infrastructure technical lead at
Fortis Games in 2024, then Sr. Manager of DevOps Engineering there in 2026.

The habit is what carried across each swing. Look at the structure, find where to
intervene, expect the obvious spot to be the weak one. Admission control and a support
rotation are that habit applied to different material.

## Meetings are a loop too

Recurring meetings got the same treatment. The team runs one daily pass over the board and
one weekly meeting of sixty to ninety minutes that absorbs backlog grooming, project
review, planning, announcements and the retrospective, with retrospectives landing about
every three weeks or whenever someone asks for one. Design reviews happen when a proposal
needs discussion and never on a schedule.

Every recurring meeting is a loop that spends the team's attention each time it fires. So
there are few of them and each one does several jobs. Technical arguments go to RFCs and
ADRs, where they are settled in writing and stay findable, which also means a decision
does not need the four countries we work across to be awake at once.

## What this approach missed

Majors also says you can only really improve at one of these things at a time, and the two
do compete for the same attention. I kept platform architecture and technical direction
after moving into management, and the cost landed somewhere specific.

I never instrumented any of it. I can describe what each process changed and I have no
numbers for a single one. Request volume and time to acknowledge were both sitting in Slack
and ClickUp, and neither was tracked. Instrumenting a process is cheap next to writing
one, and it is the first thing to fall off when your attention is already split.

Which is the part I should have caught first. I designed three structural fixes and left
out the loop that tells me whether any of them worked.
