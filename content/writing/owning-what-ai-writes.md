---
title: "Owning What AI Writes for You"
date: 2026-11-16
tags: ["engineering management", "writing", "ai"]
description: "Generating a design document got fast and reviewing one didn't. The standard I hold for AI-assisted writing is the one I already held for code: you're accountable for what you ship, whatever produced it."
---

Writing a design document used to cost an afternoon. Now it costs a prompt. Reviewing one
still costs an afternoon, and that gap is where the problems live.

I've watched documents arrive that look finished. Clean structure, confident prose, a
section for every heading a document like that usually has. Then a question in review turns
up something the author can't explain, because they didn't work it out. They collected it.

The standard I apply is the one that already exists for code. Nobody accepts "the generator
wrote it" for a Terraform module that drops a database or a migration that locks a table in
production. You committed it, so it's yours to explain and yours to fix. Generated prose
isn't a different category. If it goes out under your name, you own every claim in it.

## Defending it in review

The test I use is whether you can hold the claim up in review. Someone asks why this
approach and not the other one, or where a number came from, or what happens when the
cluster is already at capacity. You should be able to answer without going back to the
model to find out what you meant.

That isn't a rule about AI. It's the same thing I'd ask of a paragraph you typed yourself.
AI just makes it much easier to produce text you haven't thought about, so the gap between
writing something and understanding it is wider than it used to be.

## Why I don't generate the first draft

When I write a technical document, most of the value is in the part nobody reads: finding
out what the actual constraint is, checking whether the obvious option is already ruled
out, discovering that two of my assumptions contradict each other. The document is what
falls out of having done that.

Generating the document first inverts it. You get the artifact without the investigation,
and the artifact looks the same from outside. A complete-looking document is not evidence
that the problem was understood.

So I use AI on the parts that help that process along. Arguing against a design I'm
attached to. Listing the alternatives I haven't considered. Pointing at the section where
my reasoning jumps. Restructuring an explanation that I know is correct and can tell is
unclear.

## One writer, several readers

A document is written once and read by five or six people, often more. Saving yourself
twenty minutes generating it is a bad trade if everyone reading it spends an extra ten
working out what it's telling them.

Length is the usual symptom. Generated text defaults to thorough: background the reader
already has, an explanation of a concept nobody asked about, a summary of the thing they
just read. Cutting that is the cheapest editing there is, and it's the step that gets
skipped because the draft already looks done.

Four clear paragraphs beat six pages. Say the things I don't already know and stop.

## Name the mechanism

The failure mode that costs the most review time is technical prose that's confident and
wrong about this particular architecture. Generated explanations are plausible by
construction. They describe how a system like yours usually works, which is not the same as
how yours does.

So verify the claims that a decision rests on, and say which parts are assumptions. Then
drop the adjectives and name the mechanism. Here's the version I keep seeing:

> This approach will provide a scalable, reliable, and efficient deployment architecture
> while streamlining our operational workflows.

And here's the one I want:

> We'll deploy the service to EKS using our existing Argo CD and Helm setup. This keeps
> configuration in Git and avoids introducing another deployment pipeline for the team to
> maintain.

The second one tells me what you're doing, what you're reusing, and what you avoided by
doing it that way. It's also checkable, which is the point. Someone can read it and tell
you you're wrong about the Helm chart. There's nothing in "scalable" to check.

## What I don't ask for

No disclosure for routine help. If AI proofread your document or reorganised a section,
that's the same as a colleague doing it and it doesn't need a footnote. The exception is
circulating output you haven't verified, which happens and is useful, as long as you label
it so nobody builds on it by accident.

No new review process either, and no restrictions on which tools people use. Adding a
checkpoint would treat this as a tooling problem, and it isn't. The expectation is the same
one that was always there: you're accountable for what you put your name on. AI changed how
fast the draft arrives, not who answers for it.

Before I send anything, I check whether I could walk someone through every claim in it with
the document closed. If I can't, it isn't ready to send.
