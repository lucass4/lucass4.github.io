---
title: "About"
preview: "The longer version: Kafka, RabbitMQ and enterprise integrations before Kubernetes, a timeline back to 2008, and how I think about platforms and the operating models that run them."
description: "Lucas Sant' Anna: platform and infrastructure engineering leader in Metro Vancouver. Kubernetes, AWS, distributed systems, and engineering leadership."
---

I've spent most of my career designing and building infrastructure platforms, and over
time I started leading the teams that run them. At Fortis Games I moved into engineering
management and kept the Kubernetes platform architecture and technical direction with it.

I live in New Westminster, British Columbia, and I've worked remotely for most of the last
decade.

## Background

Before Kubernetes I spent years on distributed systems and event-driven architecture: Kafka
and Kafka Streams at Receptiviti, RabbitMQ and Java APIs at NS90, enterprise integrations
for airline and property clients at Grupo Mult. The languages across that work and since
have been Java, Clojure, Go and Python.

At Prodigy Education I owned platform architecture, reliability and cost for a learning
platform with as many as 200,000 concurrent players on peak days. I led the Karpenter
migration there. After I left, AWS published [a case
study](https://aws.amazon.com/solutions/case-studies/prodigy-education-eks-case-study/) on
it. Along the way I contributed kubelet image garbage-collection thresholds
([aws/karpenter-provider-aws#3264](https://github.com/aws/karpenter-provider-aws/pull/3264),
[kubernetes-sigs/karpenter#172](https://github.com/kubernetes-sigs/karpenter/pull/172))
and CPU CFS quota support
([kubernetes-sigs/karpenter#187](https://github.com/kubernetes-sigs/karpenter/pull/187))
upstream. I also moved deployments from Flux v1 to Argo CD without downtime. Most of the
35% cloud-cost reduction came from moving compute from On-Demand to Spot, after preparing
workloads for interruption with topology spreading, node affinity, disruption budgets and
more deliberate resource sizing.

## From technical leadership to engineering management

The first leadership I did was technical. At Receptiviti and then at Prodigy I held
principal-level architecture ownership, which meant I was accountable for the technical
direction without managing anybody. At Wrapbook I was technical lead for four engineers,
accountable for the direction of the work and not for the engineers themselves.

Formal people management started at ChatFood, where I managed nine distributed engineers
through an AWS and Kubernetes migration.

I joined Fortis Games as infrastructure technical lead. Existing ECS services were loosely
connected, but there was no coherent shared platform. I designed the Kubernetes platform
end to end; the architecture is
[its own case study](/work/kubernetes-platform-architecture/). I built the DevOps
Engineering function that had to own it alongside the platform.

I was setting that function's technical direction before I had the management title. In
March 2026 I became Sr. Manager, DevOps Engineering, and kept platform architecture and
technical direction with it. The team grew to ten engineers, and the work divided into
four areas of responsibility: game CI, AI infrastructure, SRE and platform/compute. I was
moving toward a hands-on lead for each area with delegated technical authority, while I
kept people management of the team. That reorganisation had started and was not finished.
The team was spread across Brazil, Portugal, England and Canada, an eight-hour spread, so
almost nothing could depend on everyone being awake at once.

Because of the spread I wrote the RFC and ADR process, the service ownership model that set
out what platform owes product teams and what they own themselves, and the incident
management model that goes with it. These practices helped engineers make decisions
asynchronously, and [how the function was built](/leadership/building-devops-engineering/)
is the
longer account. Managing it didn't end the hands-on work. I built
[a LangGraph agent](/work/infrastructure-agent/) that provisions a complete game
environment, with its tools exposed over MCP so it runs from a client an engineer already
has open.

## How I work

A platform is an architecture plus an operating model: who decides, who's on call, what's
written down. I've seen good designs sit unused because the second half was never settled,
so I now treat it as part of the design work.

I'd give engineers context and guardrails before I'd give them answers. Earlier in my
career I went deep enough on problems that I became part of the critical path, and the
decision processes I've built since are partly a correction for that.

The work usually starts as a business problem, and infrastructure is what I solve it with.
Standing up a game environment took about two days of coordinated work across several
people, which made experiments expensive enough that teams avoided them, so [an agent does
it in thirty seconds](/work/infrastructure-agent/) and dozens of environments went up in
three months. Cutting the AWS account count by over 80% removed the boundary per-game cost
reporting had been relying on, so [we audited and tagged existing resources and enforced
tagging at creation](/work/aws-multi-account-cost-attribution/) to preserve per-game
reporting.

For my own development work I use oh-my-pi across commercial and open-source models,
picking per task.

## Career

<ul class="timeline">
<li><span class="meta">Mar 2026 &ndash; present</span><span class="role">Sr. Manager, DevOps Engineering</span><span>Fortis Games &middot; Remote</span></li>
<li><span class="meta">Jan 2024 &ndash; Mar 2026</span><span class="role">Principal Software Engineer, Infrastructure Technical Lead</span><span>Fortis Games &middot; Remote</span></li>
<li><span class="meta">Aug 2022 &ndash; Jan 2024</span><span class="role">Principal Software Developer, SRE</span><span>Prodigy Education &middot; Remote</span></li>
<li><span class="meta">Feb 2022 &ndash; Aug 2022</span><span class="role">Staff Platform Systems Engineer</span><span>Wrapbook &middot; Remote</span></li>
<li><span class="meta">Dec 2020 &ndash; Dec 2021</span><span class="role">Senior DevOps Engineer</span><span>Prodigy Education &middot; Remote</span></li>
<li><span class="meta">May 2020 &ndash; Dec 2020</span><span class="role">Team Leader</span><span>ChatFood</span></li>
<li><span class="meta">Nov 2017 &ndash; Apr 2020</span><span class="role">Principal Software Engineer</span><span>Receptiviti</span></li>
<li><span class="meta">2016 &ndash; 2017</span><span class="role">Senior Software Engineer</span><span>Arcus</span></li>
<li><span class="meta">Sep 2014 &ndash; Nov 2016</span><span class="role">Senior Backend Engineer, SRE</span><span>NS90</span></li>
<li><span class="meta">2010 &ndash; 2014</span><span class="role">Solutions Architect</span><span>Grupo Mult</span></li>
<li><span class="meta">2008 &ndash; 2010</span><span class="role">Java Web Developer</span><span>Squadra Digital</span></li>
</ul>

### Education

Technologist in Systems Analysis and Development, UNIMONTES, 2013. Technical course in
Informática Gerencial, Colégio COTEMIG, 2005.

## Outside work

I've been boxing for a year and doing CrossFit for three. A homelab and a 3D printer
absorb most of my tinkering at home. I play drums and, more quietly, acoustic guitar. The
rest of my time goes to my wife and our dog.

## Contact

[LinkedIn](https://linkedin.com/in/lucassantanna) is the way to reach me, and I'm glad to
talk about engineering leadership or principal-level platform work. Code lives on
[GitHub](https://github.com/lucass4).
