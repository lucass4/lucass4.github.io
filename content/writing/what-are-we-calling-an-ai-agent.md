---
title: "What Are We Actually Calling an AI Agent?"
date: 2026-11-18
tags: ["ai", "agents", "platform engineering"]
description: "Calling something an AI agent no longer says much about how it works. The question that does is who decides what happens next: the application or the model."
---
I've built AI agents before, and one thing that keeps bothering me is how loosely the
industry uses the term.

Depending on who you ask, an agent can be anything from an LLM calling a function to a
system that plans, executes tasks, evaluates its own results, and decides what to do next.
Some frameworks have their own definitions, and now we have *agentic workflows*,
*multi-agent systems*, and a growing list of terms that seem to mean different things
depending on who's using them.

I can usually understand what someone means once they explain their implementation. But
calling something an "AI agent" doesn't tell me much about how it actually works anymore.

I don't think everyone needs to agree on a rigid definition. Software has always had
blurry boundaries between architectural patterns. Still, those differences matter when
we're designing systems and deciding how much control to give a model.

The question I keep coming back to is pretty simple: who decides what happens next?

## Who controls the execution?

Imagine we're building something to investigate Kubernetes deployment failures.

We give it access to a few read-only operations: checking deployment status, retrieving
pod events, querying logs, and inspecting container image references.

A conventional implementation could retrieve the deployment status, events, and recent
logs, send everything to an LLM, and ask for a diagnosis.

That might work perfectly well. It's probably where I'd start.

Now imagine we change the implementation. Instead of collecting everything upfront, we let
the model decide what information it needs.

It checks the deployment and discovers that several pods are unavailable. It requests the
pod events and finds an `ImagePullBackOff` error. From there, it checks the image
reference and discovers that the configured tag doesn't exist in the registry.

The model has enough evidence to explain the failure.

Both implementations can reach the same conclusion. The difference is how they get there.

In the first, the application determines which operations run and in what order. The model
interprets the information it's given.

In the second, the model chooses what to investigate based on what it finds. If the
deployment had been failing because of a missing secret, it could have followed a
completely different path.

Anthropic describes a similar distinction in [Building Effective
Agents](https://www.anthropic.com/research/building-effective-agents): workflows follow
predefined execution paths, while agents dynamically direct their own processes and tool
usage.

I find that definition useful, although things get blurry pretty quickly.

What if our application always checks deployment health first, then lets the model decide
what to investigate? Or what if the model can choose tools freely but needs approval
before executing certain operations?

I'd still consider those systems to have agentic behavior. We've simply defined boundaries
around what the model controls.

I'm comfortable letting a model decide which Kubernetes resources to inspect. Giving it
permission to restart workloads or modify production configuration is a different
conversation.

That distinction matters more to me than whether we call the system an agent. A model can
have considerable freedom to investigate while the application enforces strict limits on
what it can execute.

I'd rather make those decisions explicitly than let the choice of framework determine
them.

## You don't need an agent framework

An LLM receives context and produces a response. Sometimes that's text. Sometimes it's a
structured request to invoke a tool.

The model itself isn't executing the operation.

Our application receives the request, validates it, executes the tool, and returns the
result. The model uses that information to decide what to do next.

Repeat until it finishes or the application stops execution.

That's the basic agent loop, and you can implement it with ordinary Python.

There's no requirement to use LangGraph, an agent SDK, or MCP. A model that supports tool
calling and a relatively small amount of application code are enough to get started.

A basic Python loop gets us started, but persistence, retries, and recovery are things
we'll have to implement ourselves.

As the application grows, we also need to account for repeated tool calls, process
crashes, and deciding when the task is actually complete.

Frameworks like LangGraph can help with durable execution, checkpointing, and more complex
workflows. Those features become useful as the application grows, but the framework
doesn't determine whether something is an agent.

MCP gets mixed into this conversation too.

The Model Context Protocol standardizes how applications discover and interact with
external capabilities. We could expose our Kubernetes operations through an MCP server or
implement them as regular Python functions.

The model could make exactly the same decisions in either case.

MCP doesn't change how the model makes decisions. It changes how we expose capabilities to
the application, while the runtime still has to manage execution and state.

I think it's worth understanding these responsibilities independently before choosing the
abstractions that sit on top of them.

## The loop is simple. Operating it isn't.

Once a model starts influencing execution, we're introducing decisions that aren't
completely predictable.

Our Kubernetes investigator might inspect events first during one run and deployment
conditions first during another. Both approaches could work.

It might also select the wrong tool, misunderstand a response, or keep investigating after
it already has enough evidence.

Testing gets harder because there isn't necessarily one correct sequence of tool calls.

For a conventional workflow, I can assert that a particular input produces an expected
sequence of operations. For an agent, I care more about whether it reaches the correct
outcome, with enough evidence to support it.

I'd test our investigator against known scenarios: invalid image tags, missing secrets,
failing readiness probes, resource exhaustion, and healthy deployments.

I'd measure whether it identifies the actual problem, collects evidence to support its
diagnosis, and recognizes when there isn't enough information to reach a conclusion.

I wouldn't necessarily fail a test because the model called tools in a different order,
unless that order introduced a problem.

State management introduces another set of decisions.

An agent might collect hundreds of log entries, metrics, and Kubernetes events during an
investigation. The application needs to maintain enough information to continue the task,
but passing every previous observation back to the model on each iteration isn't a great
long-term strategy.

The application's state and the model's context are different things. We need to decide
what information stays in context, what gets summarized, and what can be retrieved later.

Then we have the problems infrastructure engineers already know well.

Imagine an agent creates a cloud resource, but the runtime crashes before recording the
result. When execution resumes, we're dealing with the same idempotency and reconciliation
problems we've had in distributed systems for years. Except now a model might decide which
operation to attempt next.

There's also the question of trust. An agent reading logs, documents, or external websites
can encounter instructions designed to manipulate its behavior. A system prompt isn't a
security boundary. Tool permissions, authorization, and approval requirements still need
to be enforced by the application.

## When does an agent make sense?

If I already know the sequence of operations required to complete a task, I'd generally
write a workflow.

I can still use an LLM inside it to interpret data, classify an issue, or generate an
explanation. There's no reason to hand over control of the entire process just because a
model is involved.

But when the next action depends on information I can't completely anticipate,
model-directed execution becomes useful.

Incident investigation is a good example. There are many possible causes for a deployment
failure, and following every diagnostic path on every execution would be wasteful.

Letting the model decide what to inspect based on the evidence gives us flexibility
without requiring unrestricted autonomy.

Maybe it can investigate but only recommend changes. Maybe it can create a pull request
but can't merge it. Maybe specific operations require approval.

I'd choose those boundaries based on what the application needs to accomplish and how much
risk I'm willing to accept.

## I'm going to build one from scratch

I want to explore these ideas by building a small Kubernetes incident investigator with
simulated cluster data.

I'll start with Python, a model that supports tool calling, and a few read-only tools. No
LangGraph or MCP initially.

I want to see the execution loop directly, test how the model behaves across different
failures, and measure whether it reaches the right conclusions. Then I'll add persistent
state, recovery, and execution controls.

Once the plain Python implementation starts getting messy, I'll compare it with a
framework-based version and see which problems the framework actually solves.

I expect the exercise will also help me understand where deterministic workflows make more
sense.

I don't expect the industry to agree on a single definition of an agent anytime soon. But
I'd rather discuss which decisions a model controls, how the runtime handles failures, and
how we evaluate the results. Those are the questions that actually influence how I'd
design the system.