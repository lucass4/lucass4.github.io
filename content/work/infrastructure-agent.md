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
understood. The cost was the coordination between them: roughly two days, spread across
more than one person, with waiting in between.

The second-order effect is what bothered me. When standing something up takes two days,
teams stop doing it speculatively. Experiments that should be cheap get batched,
deferred, or skipped, and nobody files a ticket saying "I didn't try something."

## Constraints

Whatever I built would hold credentials for real infrastructure. The failure mode for an
agent with cluster write access is not a bad answer, it is a bad change, and the blast
radius is production.

It also had to be used by people who were not going to learn a new tool. That pointed at
Slack, where the requests were already being made in prose.

## My role

I designed and built it: the graph, the tool surface, the security model, the evaluation
harness, and the cost model.

## What it does

A request in Slack produces the repository, provisions the infrastructure, and deploys a
working baseline service on EKS with observability and Okta SSO already wired up. End to
end it takes about 30 seconds against roughly two days by hand. It ran 50 times in three
months.

It is a LangGraph graph reaching internal systems over MCP. MCP is doing real work here:
the tools the agent can call are described once and consumed by the model, rather than
each integration being hand-written glue that drifts from the thing it wraps.

## Choosing the framework

I documented six alternatives before building, including Google ADK, CrewAI, and doing
nothing.

Doing nothing deserved to be on the list. Two days of toil is a cost but not an
emergency, and the honest comparison was against scripting the same sequence without a
model in the loop. What tipped it was the request side: the inputs arrive as prose with
missing details, and the part that actually took human time was interpreting the request,
not running the steps.

LangGraph won on two grounds. It was model-agnostic, so the choice of model stayed a
configuration decision rather than an architectural one. And at the time it had the
stronger production track record of the options with graph-shaped control flow, which
matters when the thing being automated writes to infrastructure.

## The security model

This is the part I would want to be asked about.

**It proposes and a human approves.** No production write reaches a cluster unreviewed.
The agent's output is a change to be looked at, not an action already taken.

**Its GitHub App can create branches but cannot merge or bypass branch protection.** The
permission boundary is enforced by GitHub, not by the agent choosing to behave. An agent
that can merge its own work has no review step regardless of what the prompt says.

**Its tools carry strict schemas**, so it cannot invent a call. A model that can emit
arbitrary tool invocations will eventually emit one that typechecks as English and not
as an API.

**Secrets are scanned and redacted before anything is embedded**, and the release gate
fails closed on a leaked credential. Failing closed is the only safe default: a gate
that fails open is not a gate.

## Evaluation and cost

Releases are gated by an eval harness in CI. Without it there is no way to tell an
improvement from a regression, because the output is not deterministic and "it seemed
fine when I tried it" is not a test.

I priced it per workflow, roughly twelve cents on a warm cache. That number existed
before anyone asked for it, which is the point: inference cost that nobody has measured
turns into a surprise on a bill, and a per-run figure makes the automation's economics
arguable instead of vibes.

## Results and lessons

About 30 seconds instead of about two days, 50 times in three months, at a known cost
per run.

The lesson I did not expect: the security model was more work than the agent. The graph
was a few days. Deciding what it was allowed to touch, making those limits enforceable
outside of the prompt, and proving they held took considerably longer, and that work is
what made it something I was willing to point at production.

The other lesson is that the eval harness should have come first. I built it after the
graph worked, which meant a stretch where I was changing behaviour with no way to
measure whether I was making it better.
