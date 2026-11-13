---
title: "Infrastructure Automation with an Agent"
weight: 2
featured: true
metric: "2 days → 30 seconds"
metric_note: "50 environments in three months"
problem: "Standing up a new game environment took about two days of coordinated work across several people, which made experiments expensive enough that teams avoided them."
role: "Designed and built it, including the security model and the release gate"
scale: "50 environments provisioned in three months"
outcome: "About 30 seconds end to end, at roughly twelve cents per run on a warm cache"
stack: ["LangGraph", "MCP", "FastAPI", "EKS", "GitHub Apps", "Okta"]
description: "A LangGraph agent, reached over MCP, that provisions a complete game environment in about 30 seconds, and the security model that makes it safe to point at production."
---

## Context

A new game environment at Fortis meant a repository, the infrastructure to run it, a
baseline service on EKS, observability wired up, and SSO configured. Each piece was
understood. The cost was the coordination between them: about two days, spread across more
than one person, with waiting in between.

At that cost, teams stop standing things up speculatively. Experiments that should be
cheap get batched, deferred or skipped, and nobody files a ticket saying "I didn't try
something."

## Constraints

Whatever I built would hold credentials for real infrastructure. An agent with cluster
write access can make a bad change to production, and that's the failure mode worth
designing around.

It also had to work for people who weren't going to learn a new tool. That pointed at
MCP: the tools appear inside the client an engineer already has open.

## My role

I designed and built it: the graph, the tool surface, the security model, the evaluation
harness, and the cost model.

## What it does

One request produces the repository, provisions the infrastructure, and deploys a working
baseline service on EKS with observability and Okta SSO already wired up. That takes
about 30 seconds. It ran 50 times in three months.

Underneath it's a LangGraph graph. The agent runs as a FastAPI service with an MCP
server mounted on it, so an MCP client (Claude Code, in practice) calls a tool and the
tool runs the graph in the same process. There's a plain HTTP route onto the same runner
for anything that isn't an MCP client. The caller's identity is read from the verified
token and never from the request body, so it comes out the same on both paths.

The tools carry their own schemas, so each integration is described once and the model
consumes that description instead of glue code that drifts from the thing it wraps. They
split by blast radius: a preview that plans and opens nothing, and an apply that opens the
pull request.

{{< architecture svg="infrastructure-agent" label="One provisioning request" caption="Solid lines are the agent acting, dashed lines carry content, and the accent dotted line is a security control that sits outside the request path. Internal service names, the tool list and the repository and cluster naming are deliberately absent." >}}
[Request] MCP client*, Claude Code
-> tool call
[Surface] MCP server*, /mcp, JWT verified, scope checked, audited
-> runs in process
[Orchestration] LangGraph*, provision graph
!! Secret redaction :: Guards what the agent reads into context and what its releases ship. Not a stage a request passes through.
-> opens a PR
[Repository] GitHub App, PR only, cannot merge
-> proposes
[Production write boundary] Human approval*
-> applies
[Behind the gate] Infrastructure, EKS service, observability, Okta SSO
---
An MCP client calls a tool on the MCP server mounted on the agent's own API. The server
verifies the caller's token, checks the required scope, and writes an audit record for
every call including the ones it refuses. The tool then runs the LangGraph provision
graph in the same process, which is what the plain HTTP route onto that graph also does.
The caller's identity is read from the verified token and never from the request body, so
it is the same on both paths. Each tool carries a strict
schema, so the agent cannot invent a call, and they are split by blast radius: a
read-only preview that plans and opens nothing, and an apply that opens the pull request.
The pull request is opened by a GitHub App that cannot merge or bypass branch protection,
which is why it sits outside the production write boundary. The agent proposes, a person
approves, and only then does the change reach infrastructure, followed by the baseline
service deployment on EKS with observability and Okta SSO. Secret redaction guards the
agent's inputs and its releases and is not a stage a request passes through.
{{< /architecture >}}

## Choosing the framework

I documented six alternatives before building, including Google ADK, CrewAI, and doing
nothing.

Doing nothing deserved to be on the list. The comparison worth making was against
scripting the same sequence with no model in the loop. What tipped it was the request side: the inputs arrive as prose with missing
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
closed on a leaked credential. It fails closed because the alternative is a gate that passes a leak through whenever it
errors, and reports success while doing it.

## Evaluation and cost

Releases are gated by an eval harness in CI. The output isn't deterministic, so without
one there's no way to tell an improvement from a regression, and "it seemed fine when I
tried it" doesn't survive contact with the next change.

I priced it per workflow, at roughly twelve cents on a warm cache. That number existed
before anyone asked for it. Inference cost nobody has measured becomes a surprise on a
bill, and a per-run figure makes the automation's economics something you can argue about.

## Results and lessons

I underestimated how much work the security model would take. The graph took a few days.
Defining what it was allowed to touch, enforcing those limits outside the prompt, and
proving they held took considerably longer, and that work is what made it something I was
willing to point at production.

The eval harness should also have come first. I built it after the graph worked, which
left a stretch where I was changing behaviour with no way to measure whether I was making
it better.
