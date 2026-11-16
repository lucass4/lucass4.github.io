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
between building and managing across a career. Their argument is that the best frontline
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
keep few of them and make each one do several jobs.

## The version I had to apply to myself

The hardest structure to look at is the one you're standing in. Early in my career I went
deep enough on problems that I became part of the critical path. Decisions waited on me,
and on a team spread across four countries that is not a small cost. An engineer in
Portugal spends the afternoon blocked on a morning that hasn't started yet in Canada.

So I treated it the same way I treated the cluster. I moved where decisions enter. Four
area leads own the technical decisions in their areas, and they have something to decide
against: the RFC and ADR process for how an argument gets settled, the service ownership
model for what the platform owes product teams, and the incident model for who holds an
incident while it's open. A lead reaching a decision without waiting for me is the point of
all three.

Then I watched a number. I tracked open support requests week to week, and that number is
what told me the rotation was holding.

That's the whole method. Find the structure producing the behaviour, change where the work
enters, then watch a number that tells you the change held. It works on a cluster, on a
week of interrupts, and on my own place in the team's critical path.
