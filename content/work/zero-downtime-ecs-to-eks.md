---
title: "Zero-Downtime Migration from ECS to EKS"
date: 2026-04-01
draft: true
weight: 4
featured: true
problem: "Moving live game workloads from ECS to EKS without a maintenance window."
role: "Designed and led the migration"
stack: ["ECS", "EKS", "Istio Ambient", "Waypoint proxies"]
description: "Cutting production workloads over from ECS to EKS using Istio Ambient Mode and waypoint proxies, with no maintenance window."
---

> Draft. The verified record for this one is thinner than the other case studies: Istio
> Ambient Mode with waypoints, cutovers completed with no downtime. The sections below
> are the structure; the specifics need to come from the migration's own documents rather
> than from reconstruction. Not published while `draft: true`.

## Context

What was running on ECS, how much of it, and why the move was worth doing.

## Constraints and scale

Traffic profile, the number of services, and why a maintenance window was not available.

## My role

Already recorded: designed and implemented the mesh layer that made the cutover
possible.

## Architecture and decisions

Ambient mode against the sidecar model, and why ambient was the migration-friendly
choice: a workload joins the mesh without its pod spec changing. Where waypoints were
placed and what L7 behaviour they were there to provide.

## Trade-offs and alternatives

Ambient was the newer path at the time. What else was considered: a sidecar mesh, an
external load balancer cutover, dual-writing.

## Implementation

The cutover order, how traffic was shifted, and what the rollback was at each step.

## Results and lessons

Confirmed: no downtime. Needs the detail on how long it took and what went wrong on the
way.
