---
title: "Diagram preview"
draft: true
noindex: true
description: "Review page for the proposed architecture diagrams. Not linked, not published."
---

Review page. Both diagrams below are proposals; the live case studies still carry the
existing structured lists. Nothing here is linked from the site.

## 1. Infrastructure agent

{{< architecture svg="infrastructure-agent" label="Infrastructure agent architecture" caption="Solid lines are the agent acting, dashed lines carry content, and the accent dotted line is a security control that sits outside the request path. The sparse line on the right is a relationship I could not verify: whether merging the branch is what triggers the apply, through GitOps. Absent on purpose: internal service names, the tool list, and repository and cluster naming." >}}
### Components

- **Slack** is the request interface. Requests arrive as prose, usually with details missing.
- **LangGraph** is the orchestration graph. It decides which tools to call and in what order.
- **MCP tools** reach internal systems. Each tool carries a strict schema, so the agent cannot invent a call.
- **GitHub App** opens a branch. It cannot merge or bypass branch protection, so it sits outside the production write boundary.
- **Human approval** is the gate on that boundary. The agent proposes and a person approves.
- **Infrastructure** is provisioned behind the gate.
- **EKS service** is the baseline deployment, with observability and Okta SSO wired up.
- **Secret redaction** guards what the agent reads into context and what its releases ship. It is not a stage a request passes through.

### Relationships

- Slack carries the request to LangGraph.
- LangGraph invokes MCP tools.
- MCP tool calls open a branch through the GitHub App.
- MCP tool calls propose a change to the human approval gate.
- Approval allows the change to reach infrastructure.
- Infrastructure provisioning is followed by the service deployment on EKS.
- Secret redaction guards the orchestration layer's inputs and outputs.
- Unverified: whether the merge is what triggers the apply.
{{< /architecture >}}

## 2. Kubernetes platform

{{< architecture svg="kubernetes-platform" label="Kubernetes platform architecture" caption="Grouped by domain, with every line labelled by what one component does to another. The cluster group holds what runs inside it; platform services are integrations the team owns so product teams do not; the bottom band is what lives outside the cluster. Cluster counts, network layout and addressing are not published." >}}
### Domains

- **Delivery** holds Git, which carries desired state, and Argo CD, which reconciles against it.
- **Kyverno** is the admission gate. Everything entering the cluster passes through it.
- **Cluster, on EKS** holds the application workloads, Istio in ambient mode, KEDA and Karpenter.
- **Platform services** are External Secrets, ExternalDNS, cert-manager and Datadog.
- **Outside the cluster** holds Terraform, Crossplane and the AWS resources they manage.

### Relationships

- Argo CD reads desired state from Git.
- Argo CD applies manifests through Kyverno.
- Kyverno admits workloads into the cluster, or denies them.
- KEDA scales workloads on the signal that drives them.
- Karpenter adds nodes for pods that are pending.
- Istio connects workloads, with mTLS and L4 per node and L7 at waypoint proxies.
- Platform services supply secrets, DNS and certificates to workloads.
- Datadog observes workloads.
- Terraform provisions the cluster and the accounts underneath it.
- Workloads claim managed dependencies through Crossplane.
- Crossplane provisions the AWS resources behind those claims.
{{< /architecture >}}
