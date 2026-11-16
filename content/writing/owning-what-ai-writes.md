---
title: "Owning What AI Writes for You"
date: 2026-11-16
tags: ["engineering management", "writing", "ai"]
description: "The document now takes a prompt and the engineering it represents still takes the afternoon. The standard I hold for AI-assisted writing is the one I already held for code: you're accountable for what you ship, whatever produced it."
---

A design document used to take an afternoon to write. The document now takes a prompt. The
engineering it is supposed to represent still takes the afternoon, and the gap between
those two is where the problems live.

I've watched documents arrive that look finished. Clean structure, confident prose, a
section for every heading a document like that usually has. Then a question in review turns
up something the author can't explain, because they didn't work it out. They collected it.
The question is usually an ordinary one. Why this approach and not the other one, where a
number came from, what happens when the cluster is already at capacity.

The standard I apply is the one that already exists for code. Nobody accepts "the generator
wrote it" for a Terraform module that drops a database or a migration that locks a table in
production. You committed it, so it's yours to explain and yours to fix. Generated prose
isn't a different category. If it goes out under your name, you own every claim in it.

AI makes it easy to produce text you haven't thought about, so the distance between writing
something and understanding it is wider than it used to be.

## Why I don't generate the first draft

When I write a technical document, most of the value is in the part nobody reads: finding
out what the actual constraint is, checking whether the obvious option is already ruled
out, discovering that two of my assumptions contradict each other. The document is what
falls out of having done that.

Generating the document first inverts the order. The artifact arrives, the investigation
doesn't, and nobody reading it can tell which one they're holding. A complete-looking
document is not evidence that the problem was understood.

So I point AI at the parts that help the investigation along. Arguing against a design I'm
attached to. Listing the alternatives I haven't considered. Pointing at the section where
my reasoning jumps. Restructuring an explanation that I know is correct and can tell is
unclear. None of that produces the draft. It pressure-tests the thinking the draft is
supposed to carry, which is the work I would be skipping if the draft came first.

## Name the mechanism

A document is written once and read by five or six people, often more. Saving twenty
minutes generating it is a bad trade when everyone reading it spends an extra ten working
out what it's telling them.

Length is the usual symptom. Generated text defaults to thorough: background the reader
already has, an explanation of a concept nobody asked about, a summary of the thing they
just read. Cutting that is the cheapest editing there is, and it's the step that gets
skipped because the draft already looks done.

The costlier failure is technical prose that is confident and wrong about this particular
architecture. Generated explanations are plausible by construction. They describe how a
system like yours usually works, which is not the same as how yours does. So verify the
claims a decision rests on, say which parts are assumptions, then drop the adjectives and
name the mechanism. The version I keep seeing:

> This approach will provide a scalable, reliable, and efficient deployment architecture
> while streamlining our operational workflows.

And the one I want:

> We'll deploy the service to EKS using our existing Argo CD and Helm setup. This keeps
> configuration in Git and avoids introducing another deployment pipeline for the team to
> maintain.

The second tells me what you're doing, what you're reusing, and what you avoided by doing
it that way. It's also checkable. Someone can read it and tell you you're wrong about the
Helm chart. There's nothing in "scalable" to check.

## What I don't ask for

No disclosure for routine help. If AI proofread your document or reorganised a section,
that's a colleague doing it and it doesn't need a footnote. The exception is circulating
output you haven't verified, which is a useful thing to do, as long as you label it so
nobody builds on it by accident.

No new review process, and no restrictions on which tools people use. A checkpoint would
treat this as a tooling problem, and the tools are not the problem. It would also say the
expectation depends on how the text was produced, and it doesn't. I want the same quality
and the same ownership from everyone, whatever they wrote it with. The expectation predates
AI and hasn't moved. What moved is how fast the draft arrives.

Before I send anything, I check whether I could walk someone through every claim in it with
the document closed. If I can't, it isn't ready to send.
