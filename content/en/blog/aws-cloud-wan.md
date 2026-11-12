---
title: "Choosing AWS Cloud WAN Over Transit Gateway"
date: 2026-11-11
draft: true
tags: ["aws", "networking", "cloud-wan", "architecture"]
---

> Outline, not a draft. Pull the specifics from the Cloud WAN technical design document
> in the archive. Keep account IDs, CIDR ranges and internal hostnames out of it.

## Where the existing network ran out

Note to write: the state before. Number of VPCs and regions, how they were connected,
and the specific thing that stopped scaling. Peering mesh growth, route table limits, or
the operational cost of adding a region.

## What Cloud WAN changes

Note to write: the core network and segment model against Transit Gateway plus route
tables. Segments as a policy object. Where the policy document lives and who can change
it.

## The decision

Note to write: this is the part worth publishing. The options considered, the criteria
used, and why Cloud WAN won. Include the arguments against it honestly: cost per
attachment, the maturity of the tooling at the time, Terraform provider support.

## Segmentation

Note to write: how segments were cut, and the isolation that had to hold between them.
Describe the shape without publishing the addressing plan.

## Migration

Note to write: how you got from the old topology to the new one without an outage. The
cutover order, and what the rollback was at each step.

## What it cost, and whether it was worth it

Note to write: attachment and data processing charges against what the previous topology
cost in engineering time.
