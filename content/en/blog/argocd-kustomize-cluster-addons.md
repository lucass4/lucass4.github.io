---
title: "Cluster Addons as a Kustomize Tree, Delivered by ArgoCD"
date: 2026-11-11
draft: true
tags: ["kubernetes", "argocd", "kustomize", "gitops"]
---

> Outline, not a draft. Headings are the argument; the notes under each are what to
> write. Nothing here publishes while `draft: true`.

## The problem

Every EKS cluster needs the same thirty-odd things before a single product workload can
land: CNI configuration, CoreDNS tuning, ExternalDNS, cert-manager, External Secrets,
Karpenter, KEDA, Kyverno, Istio, the Datadog agent, ingress. Each one has a Helm chart
with its own values schema, its own upgrade cadence, and three or four values that have
to differ per cluster and per environment.

Note to write: what the setup looked like before, and the specific failure that made the
existing approach untenable. Drift between clusters, or an upgrade that could not be
rolled out consistently.

## Why not plain Helm, and why not plain Kustomize

Note to write: Helm values files get you per-cluster variation but no composition, so
shared configuration is copy-pasted. Kustomize composes but historically fought with
charts. Explain the position each one leaves you in.

## The shape I landed on

Note to write: the base-and-overlay layout. Where the Helm chart sits in the tree, how
`helmCharts` or a rendered-manifest step fits in, what lives in a base versus a cluster
overlay versus an environment overlay. A directory tree here is worth more than prose.

## How ArgoCD picks it up

Note to write: ApplicationSet and the generator used, whether a git-directory generator
or a cluster generator. Sync waves, since addons have hard ordering: CRDs before the
controllers that consume them, cert-manager before anything requesting a certificate,
Karpenter before workloads that need nodes. Sync options that mattered.

## What broke

Note to write: the real operational lessons. CRD upgrades under server-side apply.
Pruning something load-bearing. A chart that assumed `helm install` semantics. This is
the section people will actually read.

## What I would do differently

Note to write: honest assessment, including whether the Kustomize layer was worth it
against rendering manifests in CI.
