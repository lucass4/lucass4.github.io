---
title: "Cluster Addons as a Kustomize Tree, Delivered by ArgoCD"
date: 2026-11-12
draft: true
tags: ["kubernetes", "argocd", "kustomize", "gitops"]
description: "Thirty-odd addons per cluster, each with its own chart, values schema and upgrade cadence. The base-and-overlay layout that made them one reviewable tree, and what broke."
---

> **Not publishable yet.** The structure below is the argument, and the prose under each
> heading is what I can write from the confirmed record. The blockquoted questions are the
> parts only you can answer: I have the components and the shape, not the specifics. Every
> question is one or two sentences of your answer, and once they are filled in this stops
> being a draft.
>
> Keep out of it: cluster names, account identifiers, CIDR ranges, repository paths, game
> names.

## The problem

Every EKS cluster needs the same thirty-odd things before a single product workload can
land: CNI configuration, CoreDNS, ExternalDNS, cert-manager, External Secrets, Karpenter,
KEDA, Kyverno, Istio, the Datadog agent, ingress. Each one ships a Helm chart with its own
values schema, its own upgrade cadence, and three or four values that have to differ per
cluster and per environment.

Multiply that by the number of clusters and the question stops being "how do I install
this" and becomes "how do I know all of them are the same, and how do I change one thing
everywhere."

> **Needed:** what the setup looked like before this, and the specific failure that made it
> untenable. Drift between clusters that someone found by accident? An upgrade that could
> not be rolled out consistently? The concrete incident is what makes the rest worth
> reading.

## Why not plain Helm, and why not plain Kustomize

Helm values files give you per-cluster variation but no composition, so the configuration
that every cluster shares ends up copy-pasted into each values file, and the copies drift.
Kustomize composes properly through bases and overlays, but it has historically fought with
charts, because a chart is a template engine and Kustomize wants rendered YAML.

> **Needed:** which of those two you started from, and the point at which it stopped
> working. Also whether you considered Helmfile, ArgoCD's native Helm support with multiple
> value files, or rendered manifests committed by CI, and why each lost.

## The shape I landed on

> **Needed, and this is the core of the article:** the directory layout. A tree block is
> worth more than any amount of prose here. Specifically: where the chart sits, whether you
> used Kustomize's `helmCharts` field or rendered the chart in CI and committed the output,
> what lives in a base versus a cluster overlay versus an environment overlay, and how a
> single addon's version is pinned and bumped.

## How ArgoCD picks it up

> **Needed:** whether this is an ApplicationSet and which generator, a git-directory
> generator or a cluster generator. Sync waves matter here because addons have hard
> ordering: CRDs before the controllers that consume them, cert-manager before anything
> requesting a certificate, Karpenter before workloads that need nodes. Which waves you
> used, and any sync options you had to set.

## What broke

> **Needed, and this is the section people will actually read:** the operational failures.
> CRD upgrades under server-side apply. Pruning something load-bearing. A chart that assumed
> `helm install` semantics and did not survive being rendered. Pick the two or three that
> cost you real time.

## What I would do differently

> **Needed:** an honest assessment, including whether the Kustomize layer paid for itself
> against simply rendering manifests in CI.
