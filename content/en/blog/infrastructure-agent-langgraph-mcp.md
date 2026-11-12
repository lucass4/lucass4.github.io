---
title: "An Infrastructure Agent That Provisions Environments From Slack"
date: 2026-11-11
draft: true
tags: ["ai", "langgraph", "mcp", "kubernetes", "platform"]
---

> Outline, not a draft. The numbers below are confirmed and safe to publish. Leave out
> internal service names and anything identifying specific products.

## Two days of toil

Note to write: what standing up a new game environment involved by hand. Repository,
infrastructure, a base service on EKS, observability, SSO. The handoffs between people
are the real cost, not the keystrokes.

## What it does now

The agent takes a request in Slack and produces the repository, the infrastructure, and a
running baseline service on EKS with observability and Okta SSO wired up. End to end it
takes about 30 seconds. It ran 50 times in three months.

Note to write: the workflow graph. What the nodes are, where it calls out over MCP, and
what the human sees while it works.

## Why LangGraph

Note to write: six alternatives were documented, including Google ADK, CrewAI, and doing
nothing. It came down to being model-agnostic and having the stronger production track
record at the time. Worth saying what has changed since.

## The security model

This is the section that makes the post worth writing, because most agent write-ups stop
at the demo.

Note to write, expanding each of these: it proposes and a human approves, so no
production write reaches a cluster unreviewed. Its GitHub App can create branches but
cannot merge or bypass branch protection. Its tools carry strict schemas, so it cannot
invent a call. Secrets are scanned and redacted before anything is embedded, and the
release gate fails closed on a leaked credential.

## Evaluation and cost

Note to write: the eval harness that gates releases in CI, what it asserts, and how the
cases were built. Cost came out around twelve cents per workflow on a warm cache, which
made the run cost a planned number instead of a surprise.

## Where it falls over

Note to write: the honest limits. What it refuses, what still needs a human, and the
class of request it should never be given.
