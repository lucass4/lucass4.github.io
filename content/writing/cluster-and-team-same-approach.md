---
title: "I Treat a Cluster and a Team the Same Way"
date: 2026-11-16
tags: ["systems thinking", "engineering management", "platform engineering"]
description: "I spent 2024 designing a platform and 2026 running the team that keeps it alive, and my method barely changed. Donella Meadows, the engineer/manager pendulum, and two problems that turned out to be one problem."
---

I spent 2024 designing a platform and 2026 running the team that keeps it alive. What
surprised me is how little my method changed between the two.

Here's what I mean.

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
in that priority order, and the other nine keep their project time. One week in ten each,
and everyone passes through every area in turn.

Same move twice. I changed the structure and left the people alone.

## Where I picked this up

Donella Meadows. *Thinking in Systems* makes two claims I use constantly. Behaviour comes
out of structure, so a system that keeps producing a result is a system arranged to produce
it. And where you intervene matters more than how hard you push, with the place the symptom
shows up usually being a weak spot to push on.

Neither of my two problems was a people problem. Both were steady output from an
arrangement that allowed them.

Charity Majors has a name for the career version of this, the
[engineer/manager pendulum](https://charity.wtf/p/the-engineer-manager-pendulum). You swing
between building and managing across a career. Her argument is that the best frontline
managers are never far from hands-on work, and the strongest individual contributors have
done time managing.

My own path keeps crossing that line. Nine engineers at ChatFood in 2020. Technical lead at
Wrapbook in 2022. Principal engineer and infrastructure technical lead at Fortis Games in
2024, then Sr. Manager of DevOps Engineering there in 2026.

The habit is what survived every swing. Look at the structure, pick where to intervene,
assume the obvious spot is the weak one. Admission control and a support rotation are that
habit applied to different material.

## Meetings are a loop too

Recurring meetings got the same treatment. One daily pass over the board. One weekly
meeting, sixty to ninety minutes, that absorbs backlog grooming, project review, planning,
announcements and the retrospective, with retros landing roughly every three weeks or
whenever somebody asks for one. Design reviews happen when a proposal needs one and never
on a schedule.

Every recurring meeting is a loop that spends the team's attention each time it fires. So I
keep few of them and make each one do several jobs. Technical arguments go to RFCs and
ADRs, where they get settled in writing and stay findable, which also means a decision
doesn't need four countries awake at once.

## What I got wrong

Majors also says you can only really improve at one of these things at a time, and she's
right that they compete for the same attention. I kept platform architecture and technical
direction after moving into management, and I can tell you exactly where that cost me.

I never instrumented any of it. I can describe what each process changed and I have no
numbers for a single one. Request volume and time to acknowledge were both sitting right
there in Slack and ClickUp, and I tracked neither. Instrumenting a process is cheap next to
writing one, and it's the first thing to go when your attention is already split.

Three structural fixes, and I left out the loop that would tell me whether any of them
worked.
