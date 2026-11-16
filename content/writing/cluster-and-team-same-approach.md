---
title: "I Treat a Cluster and a Team the Same Way"
date: 2026-11-16
tags: ["systems thinking", "engineering management", "platform engineering"]
description: "A cluster admitting broken workloads and a team losing its week to interrupts turned out to need the same kind of fix. Donella Meadows, the engineer/manager pendulum, and the number I watched afterwards."
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
learned while fixing it stays with them. Same problem as the cluster, which took me a while
to see.

The obvious answer to both is to write it down and ask people to be careful. A page
listing the labels a workload needs. An agreement to leave a request alone when it belongs
to someone else. Both aim at the person making the mistake and leave whatever produces it
exactly where it was.

What worked was moving the point where the work enters.

On the cluster that's [Kyverno](/work/kubernetes-platform-architecture/), running as an
admission webhook. Submit a workload without a required label and it gets rejected on the
spot. The cluster never holds that state, so nobody goes hunting for it later.

On the team it's one engineer holding the week. Daytime requests, monitoring checks, Argo
CD failures and dependency upgrades all go to whoever has the [support
rotation](/leadership/support-engineering-rotation/), with requests first. Active
incidents and after-hours alerts run through a separate on-call process. Routine
interrupts land on one person for the week, and everybody takes a turn: one week in ten
once the team was ten people, one in eight before that.

The rotation doesn't stop that work existing, the way admission stops a bad workload. It
decides where it lands, and who sees it. That second part is what moves knowledge between
areas, and it depends on the week being handed over. The outgoing engineer walks the next
one through open requests and blockers, unresolved alerts and Argo CD failures, and the
Renovate PRs still waiting, in the weekly meeting the team already had. Tasks get updated
before that conversation, so the handover starts from current state.

That weekly meeting is the only standing one besides a daily pass over the board. Sixty to
ninety minutes, and it absorbs backlog grooming, project review, planning, announcements
and the retrospective, with retros landing roughly every three weeks or whenever somebody
asks for one. Design reviews happen when a proposal needs one and never on a schedule.
Recurring meetings take the same hours the rotation is protecting, so I keep few of them
and make each one do several jobs.

## Where I picked this up

Donella Meadows. *Thinking in Systems* makes two claims I use constantly. Behaviour comes
out of structure, so a system that keeps producing a result is a system arranged to produce
it. And where you intervene matters more than how hard you push, with the place the symptom
shows up usually being a weak spot to push on.

Neither of my two problems was a people problem. Both were what those setups were always
going to produce.

Charity Majors has a name for the career version of this, the
[engineer/manager pendulum](https://charity.wtf/p/the-engineer-manager-pendulum): you swing
between building and managing across a career, and the best frontline managers stay close
to hands-on work while the strongest individual contributors have done time managing. I've
crossed that line three times, most recently from principal engineer and infrastructure
technical lead at Fortis Games in 2024 to Sr. Manager of DevOps Engineering there in 2026.

## When I was the bottleneck

Early in my career I went deep enough on problems that I became part of the critical path.
Decisions waited on me, and on a team spread across four countries that's not a small
cost. An engineer in Portugal spends the afternoon blocked on a morning that hasn't started
yet in Canada.

What I wanted was to stop being the person every decision depended on. The team is
organised in four areas: game CI, AI infrastructure, SRE and platform/compute. I was moving
toward a hands-on lead for each one, and that reorganisation was still in progress. What a
lead decides against is already in place: the RFC and ADR process for how an argument gets
settled, the service ownership model for what the platform owes product teams, and the
incident model for who holds an incident while it's open. Letting a lead reach a decision
without waiting for me was the goal of all three.

I tracked the number of open support requests each week to see whether work was piling up,
and recurring issues became backlog items for longer-term toil reduction.
