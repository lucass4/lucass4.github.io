---
title: "Infrastructure Automation with an Agent"
weight: 2
metric: "2 days → 30 seconds"
metric_note: "dozens of environments in three months"
problem: "A company that incubates game ideas needs an environment for each one. Standing one up took about two days of coordinated work across several people, which made experiments expensive enough that teams avoided them."
role: "Designed and built the agent and separate approval paths for incubator sandboxes and service onboarding"
scale: "Dozens of environments provisioned in three months"
outcome: "About 30 seconds for the standard incubator sandbox flow; service onboarding took a PR-review path"
stack: ["LangGraph", "MCP", "FastAPI", "EKS", "GitHub"]
description: "A LangGraph agent with two paths: automated standard incubator sandboxes and PR-reviewed repository onboarding for services behind SSO."
---

## Context

The company incubated games. Ideas get built, tested, and either continued or dropped, and
every one of them needs somewhere to run. The cost of standing up an environment is
therefore a cap on how many ideas the company can afford to try.

A new game environment meant a repository, the infrastructure to run it, a baseline
service on EKS, observability wired up, and SSO configured. Each piece was understood. The
cost was the coordination between them: about two days, spread across more than one
person, with waiting in between.

At that cost, teams stop standing things up speculatively. Experiments that should be
cheap get batched, deferred or skipped, and nobody files a ticket saying "I didn't try
something."

## Constraints

Whatever I built would hold credentials for real infrastructure. An agent that can merge
changes for a standardized sandbox must not automatically get the same authority over a
separately onboarded team service. The trust boundary differed by workflow.

It also had to work for people who weren't going to learn a new tool. That pointed at
MCP: the tools appear inside the client an engineer already has open.

## My role

I designed and built it: the graph, the tool surface, the security model, the evaluation
harness, and the cost model.

## What it does

There were two workflows, with approval matched to risk. Incubator environments followed a
fixed shape, so the agent's changes for them were checked and applied automatically, in a
sandbox. The roughly 30-second provisioning figure refers to that path, and dozens of
environments were provisioned in three months. Onboarding a team's own service went
through human review before anything was deployed.

Underneath it's a LangGraph graph behind an MCP server, so a tool call from an MCP client
runs the graph directly, and callers that aren't MCP clients reach the same graph over
HTTP. The caller's identity comes from authentication, never from what the request says
about itself, so it is the same on both paths.

The tools carry their own schemas, so each integration is described once and the model
reads that description. There is no glue code in between to drift from the thing it wraps.

{{< architecture svg="infrastructure-agent" label="One provisioning request" caption="Repository-onboarding path only: the agent opens a reviewable PR before the team service is deployed. The standardized incubator sandbox path merges automatically and is not shown. Internal service names and repository details are omitted." >}}
[Request] MCP client*, any client
-> tool call
[Surface] MCP server*, authenticated, authorized, audited
-> runs in process
[Orchestration] LangGraph*, provision graph
!! Secret redaction :: Guards what the agent reads into context and what its releases ship. Not a stage a request passes through.
-> opens a PR
[Repository onboarding] Code review, reviewable PR
-> requests review
[Service onboarding boundary] Human approval*
-> applies
[Behind the gate] Infrastructure, EKS service, observability, SSO
---
An MCP client calls a tool on the MCP server mounted on the agent's own API. The server
authenticates the caller, checks that the caller may use the tool, and records every call,
including refused ones. The tool then runs the LangGraph provision graph in the same
process, which is also where non-MCP callers arrive. The caller's identity comes from
authentication, so it is the same on both paths. Each tool carries a strict schema. A
read-only preview plans without changes. The application path opens a pull request, and a
person reviews it before the team-built service is deployed. Secret redaction guards the
agent's inputs and its releases and is not a stage a request passes through.
{{< /architecture >}}

## Choosing the framework

I documented six alternatives before building, including Google ADK, CrewAI, and doing
nothing.

Doing nothing deserved to be on the list. The comparison worth making was against
scripting the same sequence with no model in the loop. What tipped it was the request
side: the inputs arrive as prose with missing
details, and the part that actually consumed human time was interpreting the request, not
running the steps.

LangGraph won on two grounds. It was model-agnostic, so which model to use stayed a
configuration decision and never became an architectural one. And at the time it had the
strongest production track record among the options with graph-shaped control flow, which
counts when the thing being automated writes to infrastructure.

## The security model

Its tools carry strict schemas, so it can't invent a call. A model free to emit arbitrary
tool invocations will eventually emit one that reads as plausible English and isn't a real
API.

Secrets are scanned and redacted before anything is embedded, and the release gate fails
closed on a leaked credential. It fails closed because the alternative is a gate that
passes a leak through whenever it
errors, and reports success while doing it.

## Evaluation and cost

Releases are gated by an eval harness in CI. The output isn't deterministic, so without
one there's no way to tell an improvement from a regression, and "it seemed fine when I
tried it" doesn't survive contact with the next change.

I priced it per workflow from real runs, which showed a low per-run cost. The figure
existed before anyone asked for it. Inference cost nobody has measured becomes a surprise
on a bill, and a per-run figure makes the automation's economics something you can argue
about.

## Results and lessons

I underestimated how much work the security model would take. The graph took a few days.
Defining what it was allowed to touch, enforcing those limits outside the prompt, and
proving they held took considerably longer, and that work is what made it something I was
willing to point at production.

The eval harness should also have come first. I built it after the graph worked, which
left a stretch where I was changing behaviour with no way to measure whether I was making
it better.
