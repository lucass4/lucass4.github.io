---
title: "Infrastructure Automation with an Agent"
date: 2026-02-20
weight: 2
featured: true
problem: "Standing up a new game environment took about two days of coordinated work across several people, which made experiments expensive enough that teams avoided them."
role: "Designed and built it, including the security model and the release gate"
scale: "50 environments provisioned in three months"
outcome: "About 30 seconds end to end, at roughly twelve cents per run on a warm cache"
stack: ["LangGraph", "MCP", "Slack", "EKS", "GitHub Apps", "Okta"]
description: "A LangGraph and MCP agent that provisions a complete game environment from Slack in about 30 seconds, and the security model that makes it safe to point at production."
---

## Context

A new game environment at Fortis meant a repository, the infrastructure to run it, a
baseline service on EKS, observability wired up, and SSO configured. Each piece was
understood. The cost was the coordination between them: about two days, spread across more
than one person, with waiting in between.

The second-order effect is what bothered me. At that cost, teams stop standing things up
speculatively. Experiments that should be cheap get batched, deferred
or skipped, and nobody files a ticket saying "I didn't try something."

## Constraints

Whatever I built would hold credentials for real infrastructure. An agent with cluster
write access can make a bad change to production, and that's the failure mode worth
designing around.

It also had to be used by people who weren't going to learn a new tool. That pointed at
Slack, where the requests were already being made in prose.

## My role

I designed and built it: the graph, the tool surface, the security model, the evaluation
harness, and the cost model.

## What it does

A request in Slack produces the repository, provisions the infrastructure, and deploys a
working baseline service on EKS with observability and Okta SSO already wired up. That
takes about 30 seconds. It ran 50 times in three months.

Underneath it's a LangGraph graph reaching internal systems over MCP. MCP is doing real
work there: the tools the agent can call are described once and consumed by the model, so
each integration isn't hand-written glue that drifts from the thing it wraps.

## Choosing the framework

I documented six alternatives before building, including Google ADK, CrewAI, and doing
nothing.

Doing nothing deserved to be on the list. Two days of toil is a cost but not an emergency,
and the comparison worth making was against scripting the same sequence with no model in
the loop. What tipped it was the request side: the inputs arrive as prose with missing
details, and the part that actually consumed human time was interpreting the request, not
running the steps.

LangGraph won on two grounds. It was model-agnostic, so which model to use stayed a
configuration decision and never became an architectural one. And at the time it had the
strongest production track record among the options with graph-shaped control flow, which
counts when the thing being automated writes to infrastructure.

## The security model

The agent proposes and a human approves. No production write reaches a cluster unreviewed,
and its output is a change to be looked at.

Its GitHub App can create branches but can't merge or bypass branch protection. That
boundary is enforced by GitHub, which is why it holds even if the model is talked into
trying.

Its tools carry strict schemas, so it can't invent a call. A model free to emit arbitrary
tool invocations will eventually emit one that reads as plausible English and isn't a real
API.

Secrets are scanned and redacted before anything is embedded, and the release gate fails
closed on a leaked credential. It fails closed because the alternative is a
gate that passes a leak through whenever it errors, and reports success while doing it.

## Evaluation and cost

Releases are gated by an eval harness in CI. The output isn't deterministic, so without
one there's no way to tell an improvement from a regression, and "it seemed fine when I
tried it" doesn't survive contact with the next change.

I priced it per workflow, at roughly twelve cents on a warm cache. That number existed
before anyone asked for it. Inference cost nobody has measured becomes a surprise on a
bill, and a per-run figure makes the automation's economics something you can argue about.

## Results and lessons

The timings and the run count are above. What's worth saying here is what I got wrong.

The security model was more work than the agent. The graph took a few days. Deciding what
it was allowed to touch, making those limits enforceable outside the prompt, and proving
they held took considerably longer, and that work is what made it something I was willing
to point at production.

The eval harness should also have come first. I built it after the graph worked, which
left a stretch where I was changing behaviour with no way to measure whether I was making
it better.
