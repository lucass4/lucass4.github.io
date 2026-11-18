---
title: "What Actually Makes an AI Agent an Agent?"
date: 2026-11-18
tags: ["ai", "agents", "platform engineering"]
description: "An agent is a model choosing its next action from what it just observed. Where that loop ends, what the runtime and MCP are responsible for, and when a conventional workflow is the better choice."
---
I've [built AI agents before](/work/infrastructure-agent/), and I've been following the
development of agentic systems for a while. One thing that keeps bothering me is how
differently the industry defines what an agent actually is.

Some people call any LLM with access to tools an agent. Others argue that an agent needs
to plan, execute multiple steps, observe results, and adapt its approach. Then we have
agentic workflows, multi-agent systems, and frameworks that seem to have their own
interpretations of what an agent should be.

The terminology has become so broad that two engineers can say they're building an agent
while describing fundamentally different architectures.

I don't think there's necessarily a single definition everyone needs to agree on. But the
differences matter when we're designing these systems, deciding how much autonomy to give
them, or evaluating whether an agent is even the right solution.

So I wanted to break down what actually happens inside an agent, where the boundaries are,
and what separates one from a conventional workflow.

## It starts with a decision loop

The definition I find most useful is relatively simple: an AI agent is a system that uses
a model to decide what actions to take, executes those actions, observes the results, and
uses that information to determine what to do next.

The fundamental mechanism is a feedback loop: goal, decision, action, observation, and
repeat.

Let's use a fictional Kubernetes incident as an example.

Imagine we have an agent with access to a few read-only tools. It can inspect deployments,
retrieve pod events, query logs, and check container image references.

We give it a task:

*Investigate why checkout-api is unhealthy. Find the likely cause and recommend a fix.
Don't change anything.*

The model might start by checking the deployment status. It discovers that several pods
are unavailable.

Based on that observation, it decides to inspect the pod events and finds an
`ImagePullBackOff` error.

Now it has new information. It skips CPU utilization and application logs, checks the
image reference, and compares it with the available tags in the container registry.

The deployment references a tag that doesn't exist.

At this point, the agent has enough evidence to explain the failure and recommend a
correction.

There's nothing particularly sophisticated about the individual operations. Any engineer
familiar with Kubernetes could follow the same steps.

The part that matters is that we didn't prescribe the investigation sequence.

The model selected each action based on the information it received. If the problem had
been a missing secret or a failing readiness probe, it could have followed a completely
different path.

That ability to choose what happens next based on observations is the behavior I'm
interested in.

## Couldn't we just write a workflow?

Yes. And depending on the problem, we probably should.

We could implement the same investigation as a Python application that always retrieves
deployment status, pod events, and container logs, then sends everything to an LLM to
produce a diagnosis.

That application might generate exactly the same answer as our agent.

The difference is in who controls the execution.

In the workflow, the developer determines which operations run and in what order. The
model interprets the results, but the application controls the investigation path.

In the agent, we give the model a goal and a set of capabilities. It decides which
information to retrieve, what to investigate next, and when it has enough evidence to
finish.

Anthropic makes a similar distinction in its article [Building Effective
Agents](https://www.anthropic.com/research/building-effective-agents): workflows follow
predefined code paths, while agents dynamically direct their own processes and tool usage.

That distinction still leaves some questions open.

What if our workflow always checks deployment health first, then gives the model control
over the investigation?

What if the model can choose between tools but can't execute more than one before
returning control to the application?

Or what if an agent can investigate freely but has to follow a deterministic approval
process before changing anything?

These aren't unusual designs. In fact, combining deterministic control with model-driven
decisions is often exactly what we want in production.

This is why I think of autonomy as a spectrum.

And there's another distinction worth making. Deciding what action to take and having
permission to execute it are separate concerns.

I might trust a model to decide which Kubernetes resources to inspect. That doesn't mean I
want it independently deciding to restart workloads or modify production configuration.

The runtime can enforce those boundaries regardless of how much freedom the model has to
investigate.

## The model isn't the entire agent

Another thing that gets lost in discussions about agents is where the model's
responsibility ends and the rest of the application begins.

An LLM doesn't inherently execute commands, call APIs, or maintain durable application
state. It receives context and produces a response.

Sometimes that response is text. Other times, it's a structured request to invoke a tool.

Suppose our model requests Kubernetes events for a particular pod.

Something needs to receive that request, validate its arguments, check permissions,
execute the operation, and return the result.

That's the responsibility of the surrounding application, usually called the agent runtime
or orchestrator.

It also manages execution history, timeouts, retries, state, and stopping conditions.

Once you separate those responsibilities, the basic implementation is straightforward.

You don't actually need an agent framework to build an agent.

A Python loop can send a goal and available tools to a model, execute the tools it
requests, return the results, and repeat until the model finishes or the application
reaches an execution limit.

A production system needs considerably more work, but the fundamental mechanism doesn't
change.

Frameworks like LangGraph provide capabilities such as durable execution, checkpointing,
branching workflows, and human-in-the-loop interactions.

Those are useful engineering abstractions. They don't define whether the application is
agentic.

The model's role in determining the execution path does.

## Where does MCP fit?

MCP is another technology that frequently appears in discussions about agents, sometimes
as though it's a necessary part of building one.

The Model Context Protocol standardizes how AI applications discover and interact with
capabilities exposed by external systems.

For our Kubernetes example, we could expose a few operations through an MCP server:
retrieving deployment status, inspecting pod events, or querying container logs.

An agent could access those capabilities through an MCP client.

But MCP doesn't determine which tool should be called or what the agent should do with its
result.

We could replace those MCP tools with ordinary Python functions, and the decision-making
process would remain essentially the same.

We could also expose the exact same tools to a deterministic workflow.

They solve different problems.

The model selects actions based on the context it receives. The runtime coordinates
execution and enforces boundaries. MCP standardizes access to external capabilities.

I find this separation useful because it lets us evaluate each component on its own.

## State, context, and memory

Our Kubernetes investigator needs information from previous steps to make useful
decisions.

It couldn't decide to investigate the container registry without first observing the image
pull failure.

But how that information is maintained matters.

Imagine an investigation that collects hundreds of log entries, metrics queries,
deployment events, and configuration details.

The application might preserve all those observations as part of its execution state.

Does the model need to receive everything on every iteration?

Probably not.

The runtime can preserve the complete state while selecting or summarizing the information
relevant to the next decision.

That's the distinction between state and context. State is what the application maintains.
Context is what the model receives for a particular inference.

Memory adds another dimension. An agent might retain useful information between
executions, such as documentation, previous findings, or user preferences.

That information doesn't automatically become part of the model's knowledge. The
application has to store it and make it available when needed.

For long-running agents, this becomes an important architectural decision.

Continuously appending every observation to a conversation eventually becomes expensive
and difficult to manage. We need strategies for selecting relevant information, preserving
execution state, and retrieving previous context when necessary.

This is where context engineering starts to matter as much as prompt engineering.

## Production agents are still distributed systems

The agent loop itself isn't particularly complicated.

Making it dependable is the hard part.

A model can select the wrong tool, misunderstand a response, repeat an operation, or
conclude that it has completed a task when it hasn't.

Those problems become more serious when the agent can modify external systems.

Imagine an agent creates a cloud resource. The API call succeeds, but the runtime crashes
before recording the result.

When execution resumes, the agent might attempt the same operation again.

Now we're dealing with familiar distributed systems problems.

Is the operation idempotent? Can we recover the result? Do we have a durable execution
record? What happens when a request times out after the remote service has already
completed it?

Agent frameworks don't eliminate these concerns.

Then there's security.

Agents often consume information from sources we don't control, including logs,
documentation, websites, and tool responses.

That information might contain malicious instructions intended to influence the model's
behavior.

We can't rely on a system prompt as the only security boundary. Permissions, tool
authorization, and approval requirements need to be enforced by the application.

And finally, we need to know whether the system actually works.

For our Kubernetes investigator, producing a convincing explanation isn't enough.

I'd want to test it against a collection of known incidents: invalid image tags, missing
secrets, failing health checks, resource exhaustion, and healthy deployments.

For each scenario, I'd evaluate whether the agent identified the correct cause, collected
supporting evidence, respected its permissions, and avoided unnecessary tool calls.

The model might follow different investigation paths across multiple runs. That's fine,
provided those paths lead to correct and safe outcomes.

The important part is measuring task completion against observable evidence.

## So when should we build an agent?

After looking at the different architectures, I don't think the most useful question is
whether a system technically qualifies as an agent.

I'd rather ask how much control the model actually needs to solve the problem.

If the steps are known and predictable, I'd start with a conventional workflow.

If I need an LLM to interpret information within that workflow, I can add a model call
without giving it control over the entire execution.

But when the next action depends on information I can't completely anticipate,
model-directed execution becomes more interesting.

Incident investigation is a good example. There are many possible causes for a failed
deployment, and following every diagnostic path on every execution would be inefficient.

Letting the model choose what to investigate based on the evidence means the system only
follows the paths the evidence points to.

That doesn't mean it needs unrestricted autonomy.

We can still control which tools are available, enforce permissions, limit execution time,
require approvals, and independently verify the result.

For me, that's a sensible way to approach agent design: let the model make decisions where
flexibility is useful, and keep deterministic controls where predictability matters.

## Putting the theory into practice

I want to explore these ideas further by building a small agent from scratch.

The plan is to create a Kubernetes incident investigator in Python, initially using
simulated cluster data and a handful of read-only tools.

I'll start without LangGraph or MCP so I can work directly with the model's tool-calling
interface and implement the execution loop myself.

Then I'll introduce state persistence, execution limits, recovery, and evaluations.
Eventually, I can replace the simulated tools with read-only integrations and compare the
implementation with one using an agent framework.

I'm particularly interested in seeing where the simple Python loop starts becoming
difficult to maintain, and which problems a framework actually solves.

The industry will probably continue using the word *agent* for a broad range of
architectures. I don't think that's going away.

But when someone tells me they're building an AI agent, the first thing I want to
understand is how their system makes decisions, what controls its execution, and how they
know it has accomplished its goal.

Those answers tell me considerably more about the architecture than the label does.

## References

- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [OpenAI: A Practical Guide to Building AI Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
