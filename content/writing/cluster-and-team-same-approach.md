---
title: "I Treat a Cluster and a Team the Same Way"
date: 2026-11-16
tags: ["systems thinking", "engineering management", "platform engineering"]
description: "A cluster admitting broken workloads and a team losing its week to interrupts needed the same fix: move the point where work enters. Donella Meadows, the engineer/manager pendulum, and the number I watched afterwards."
---

I spent 2024 designing a platform and 2026 running the team that keeps it alive. What
surprised me is how little my method changed between the two.

A Kubernetes cluster will take almost anything I hand it. A workload missing the label
that routes its logs. A pod asking for privileges it has no use for. A deployment with no
disruption budget, so the next node drain quietly takes it down. All of it gets admitted,
runs happily, and turns into something a person has to find weeks later and chase down.

Now the team. Access requests, a service acting odd, an alert firing, a dependency upgrade
sitting in review. That work shows up all week and lands on whoever notices it first.
Everybody gets interrupted a little, nobody's project moves much, and whatever one person
learned while fixing it stays with them.

Those two look nothing alike. They're the same problem.

The obvious answer to both is to write it down and ask people to be careful. A page
listing the labels a workload needs. An agreement to leave a request alone when it belongs
to someone else. Both aim at the person making the mistake and leave whatever produces it
exactly where it was.

What worked was moving the point where the work enters.

On the cluster that's [Kyverno](/work/kubernetes-platform-architecture/), running as an
admission webhook. Submit a workload without a required label and it gets rejected on the
spot. The cluster never holds that state, so nobody goes hunting for it later.

On the team it's one engineer holding the week. Requests, alerts and dependency upgrades
all route to whoever has the [support rotation](/leadership/support-engineering-rotation/),
in that priority order, so the interrupts concentrate on one person instead of reaching
nine. One week in ten each, and everyone passes through every area in turn.

That last part is what moves knowledge between areas, and it depends on the week being
handed over. The outgoing engineer walks the next one through open requests and blockers,
unresolved alerts and Argo CD failures, and the Renovate PRs still waiting, in the weekly
meeting the team already had. Tasks get updated before that conversation, so the handover
starts from current state.

## Where I picked this up

Donella Meadows. *Thinking in Systems* makes two claims I use constantly. Behaviour comes
out of structure, so a system that keeps producing a result is a system arranged to produce
it. And where you intervene matters more than how hard you push, with the place the symptom
shows up usually being a weak spot to push on.

Neither of my two problems was a people problem. Both were steady output from an
arrangement that allowed them.

Charity Majors has a name for the career version of this, the
[engineer/manager pendulum](https://charity.wtf/p/the-engineer-manager-pendulum): you swing
between building and managing across a career, and the best frontline managers stay close
to hands-on work while the strongest individual contributors have done time managing. I've
crossed that line three times, most recently from principal engineer and infrastructure
technical lead at Fortis Games in 2024 to Sr. Manager of DevOps Engineering there in 2026.

Look at the structure, pick where to intervene, assume the obvious spot is the weak one.

## The meeting schedule

Recurring meetings got the same treatment. One daily pass over the board. One weekly
meeting, sixty to ninety minutes, that absorbs backlog grooming, project review, planning,
announcements and the retrospective, with retros landing roughly every three weeks or
whenever somebody asks for one. Design reviews happen when a proposal needs one and never
on a schedule.

Recurring meetings take time away from project work, so I keep few of them and make each
one do several jobs.

## The version I had to apply to myself

Early in my career I went deep enough on problems that I became part of the critical path.
Decisions waited on me, and on a team spread across four countries that is not a small
cost. An engineer in Portugal spends the afternoon blocked on a morning that hasn't started
yet in Canada.

So I moved where decisions enter. Four area leads own the technical decisions in their
areas, and they have something to decide against: the RFC and ADR process for how an
argument gets settled, the service ownership model for what the platform owes product
teams, and the incident model for who holds an incident while it's open. A lead reaching a
decision without waiting for me is the point of all three.

I tracked the number of open support requests each week to see whether work was starting to
pile up again.
