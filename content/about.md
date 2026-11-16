---
title: "About"
preview: "The longer version: distributed systems before Kubernetes, principal-level architecture ownership at Receptiviti and Prodigy, and why building the DevOps Engineering function at Fortis followed from the architecture instead of replacing it."
description: "Lucas Sant' Anna: platform and infrastructure engineering leader in Metro Vancouver. Kubernetes, AWS, distributed systems, and engineering leadership."
---

I'm a platform and infrastructure engineer who moved into leading the function and kept
the architecture. The work I care about sits where a system's shape is still undecided:
design it, take it to production, then run and evolve it with a team that owns it.

I live in New Westminster, British Columbia, and I've worked remotely for most of the last
decade.

## Background

Before Kubernetes I spent years on distributed systems and event-driven architecture: Kafka
and Kafka Streams at Receptiviti, RabbitMQ and Java APIs at NS90, enterprise integrations
for airline and property clients at Grupo Mult.

At Prodigy Education I owned platform architecture, reliability and cost for infrastructure
serving around 10 million monthly users with peaks above 150,000 concurrent. I led the
Karpenter migration there, contributing upstream along the way, and moved deployments from
Flux v1 to ArgoCD without downtime.

## From technical leadership to engineering management

The first leadership I did was technical, not managerial. At Receptiviti and then at
Prodigy I held principal-level architecture ownership: the decisions were mine, the people
weren't.

Formal people management started at ChatFood, where I managed nine distributed engineers
through an AWS and Kubernetes migration. Wrapbook was technical leadership again: technical
lead for four engineers, accountable for the technical direction of the work and not for
the engineers themselves.

I joined Fortis Games as infrastructure technical lead and designed the Kubernetes
platform end to end; the architecture is
[its own case study](/work/kubernetes-platform-architecture/). The function that had to
own it was built alongside it, and by the end it was ten engineers through four area
leaders, one each for CI/CD, SRE, platform and AI infrastructure. The team was spread
across Brazil, Portugal, England and Canada, an eight-hour spread, so almost nothing could
depend on everyone being awake at once.

I was setting the function's technical direction before I had the management title. When it
caught up, the formal people management came with it and I kept platform architecture and
technical direction alongside it. Because of the spread I wrote the RFC and ADR process,
the service ownership model that set out what platform owes product teams and what they own
themselves, and the incident management model that goes with it. All three exist so
engineers can decide without waiting for me, and
[how the function was built](/leadership/building-devops-engineering/) is the longer
account. Managing it didn't end the hands-on work: I built a LangGraph agent, reached over
MCP, that provisions a complete game environment.

## How I work

A platform is an architecture plus an operating model: who decides, who's on call, what's
written down. I've seen good designs sit unused because the second half was never settled,
so I now treat it as part of the design work.

I'd give engineers context and guardrails before I'd give them answers. Earlier in my
career I went deep enough on problems that I became part of the critical path, and the
decision processes I've built since are partly a correction for that.

I focus on cost, latency, throughput, and the time it takes to get from a request to a
running environment.

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

[LinkedIn](https://linkedin.com/in/lucassantanna) is the way to reach me. Code lives on
[GitHub](https://github.com/lucass4).
