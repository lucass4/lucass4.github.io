---
title: "A Support Rotation for a Team Across Eight Time Zones"
draft: true
weight: 4
featured: true
metric: "1 of 6 duties is 24/7"
metric_note: "the other five are work hours only"
problem: "A platform team spread over an eight-hour range supported every game studio in the company. Without a boundary, the platform team becomes the escalation point for everything on the cluster."
role: "Wrote the incident management and service ownership models, and the on-call responsibilities they run on"
scale: "Eight engineers in a weekly rotation, four countries"
outcome: "Support is a defined week: scoped duties, a named owner, a handoff meeting"
stack: ["PagerDuty", "Datadog", "Slack", "Runbooks", "Blameless postmortems"]
description: "The support engineer rotation at Fortis Games: one week each across eight engineers, five of six duties scoped to working hours, and an incident model built around declaring early."
---

> Draft. The content comes from the team's own documents, but three things need checking
> before this publishes. They are listed at the end.

## Context

The platform team supported every game studio in the company and was spread across Brazil,
Portugal, England and Canada. Eight hours of range means there is no hour when everyone is
working and no hour when nobody is. The second half is the dangerous one: a team that
always has somebody awake can end up expected to answer at any hour, because somebody
always could.

The service ownership model already said the platform team is not the escalation point for
every problem on the cluster. Support is where that line holds or does not.

## Constraints

Game traffic has no quiet hour, so something genuinely urgent has to reach a person fast.
Most of what arrives is not that: a question, a permission, a thing that looks broken and
is a misconfiguration. Treating all of it as urgent is how a platform team ends up with no
time to build anything.

Whatever I wrote also had to be followable by someone a week into the job, at the moment
they are least able to go and ask.

## My role

I wrote the incident management and service ownership models, and the on-call
responsibilities the rotation runs on.

## The design

A named week, not a vague duty. Eight engineers in an ordered roster, one week each, with
the current holder and that week's dates recorded where anyone can see them. Anyone asking
"who do I talk to" has an answer without asking.

The decision I would defend hardest is which duties are 24/7 and which are not. Six
responsibilities, each with an explicit expectation attached:

{{< stack label="On-call duties, and when they apply" caption="Taken from the on-call responsibilities document. The expectation beside each duty is the part that does the work." >}}
Emergency response :: Lead and coordinate during a major incident :: At any moment during the on-call week
Channel monitoring :: Watch the open infrastructure channel, triage what arrives :: Working hours only
Weekly handoff :: Brief the next engineer, including what is still open :: Working hours only
Ad-hoc requests :: Take the small things, prioritise by impact :: Working hours only
Health checks :: Look for the problem before it is an incident :: Working hours only
Improvement feedback :: Bring on-call friction to review, change the process :: Working hours only
{{< /stack >}}

Only the first is unbounded. On a distributed team the other five would have drifted into
"whenever you see it" if the document had not said otherwise in writing.

Declaring is deliberately cheap: an incident opens with a slash command in Slack, so
raising something that turns out to be nothing costs almost nothing. People sit on problems
when declaring feels like an accusation or a form.

The handoff is a meeting. The outgoing engineer walks the incoming one through the week
including what is still open, and across eight hours of spread that conversation is the
only point where the whole week sits in one place.

Security incidents route to their own process. A responder under pressure should not be
deciding which document applies.

## Documentation, in three parts

Every practice is written three times, and this is the pattern I would reuse. An overview
says why the thing exists and when it applies. A template is the blank to fill in. A
playbook says how to run it, including how to facilitate the meeting. Incident response has
all three, so do blameless postmortems, so do tabletop exercises.

The runbook guidance explains the split in one phrase: the template is designed for
responders under pressure. A document that teaches and a document you follow at 3am are not
the same document, and most teams ask one file to do both.

Postmortems are blameless by design, with a facilitation playbook so the meeting does not
drift into who touched it last. The piece I have seen least often elsewhere is the tabletop
exercises, which have their own overview, template and playbook plus a record of the ones
already run. A rotation of eight means most engineers lead few real severe incidents, so
without rehearsal the first one they lead is live.

## Trade-offs

Scoping five duties to working hours means some things wait. A request raised late in a
Brazil afternoon can sit until a Canada morning. That is the intended behaviour and it still
costs real hours.

A week is long enough that a bad one is heavy. Shorter shifts spread the load and add
handoffs, which is where context goes missing.

## What I would do differently

Write the ownership boundary and the support rotation at the same time. The rotation
answers "who is holding this week" and the ownership model answers "which things should
arrive at all". The second question is the one that controls the volume, and it is the one
I wrote first and revisited least.

## Open before this publishes

1. **Attribution.** The incident hub credits the team, while my record has me writing the
   incident management and service ownership models. Which parts are mine, which are the
   team's, and how should that read?
2. **Outcomes.** There are no numbers here. Time to declare, incident volume, how often
   the rotation was interrupted outside hours, anything measured before and after.
3. **Rotation size.** Eight is what the roster shows now. Was it eight throughout, or did
   it grow?
