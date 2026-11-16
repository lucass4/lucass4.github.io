# Specification: Personal Website Repositioning

**Repository:** `lucass4/lucass4.github.io`
**Website:** `lucassantanna.com` / `lucassantanna.ca`
**Stack:** Hugo, custom layouts, CSS, GitHub Pages
**Scope:** Information architecture, content, homepage, navigation, case studies and resume access
**Objective:** Present a coherent career narrative that supports Engineering Manager and Principal Engineer opportunities.

## 1. Background and problem

The website currently presents me primarily as a technical architect who recently moved into management.

That representation is incomplete.

I have approximately 18 years of software engineering experience, including Principal Engineer responsibilities at multiple companies. I have led infrastructure architecture, technical decisions and cross-team engineering initiatives for years.

At Fortis Games, I initially joined as Principal Software Engineer and Infrastructure Technical Lead. I subsequently moved into a formal Senior Engineering Manager role, responsible for a team of approximately 10 engineers, including hands-on technical leaders.

My career now supports two possible paths:

- **Engineering Manager / Senior Engineering Manager:** Building teams, developing engineers, establishing engineering practices, setting priorities and delivering through others.
- **Principal Engineer / Staff+ Infrastructure:** Platform architecture, distributed systems, Kubernetes, cloud infrastructure, engineering automation and technical direction across teams.

The current website does not adequately communicate either profile. Technical projects dominate the presentation, while management accomplishments are buried in the About page.

The goal is to correct the presentation without creating two separate professional identities.

## 2. Positioning

The website should present me as:

**An engineering leader with deep technical expertise in platform engineering, infrastructure and distributed systems.**

Suggested homepage headline:

> I build infrastructure platforms and engineering teams.

Suggested introductory text:

> I'm an engineering leader with 18 years of experience in backend systems, cloud infrastructure and platform engineering. I've worked as a Principal Engineer, owned infrastructure architecture across multiple companies, and most recently built and led DevOps Engineering at Fortis Games.
>
> My work covers both the technical systems and the teams responsible for building and running them.

These are starting points. Refine them to match the existing website's direct, technical writing style.

### Positioning constraints

- Do not describe me as a Director, VP or CTO.
- Do not imply that I've spent 18 years in engineering management.
- Do not understate my Principal Engineer experience because my latest role is management.
- Do not describe me exclusively as a hands-on individual contributor.
- Do not create different or conflicting career histories for different audiences.
- Distinguish individual implementation, technical leadership and people management.
- Avoid generic executive language such as "visionary leader", "driving transformation" or "passionate about empowering teams".
- Preserve my actual job titles and employment dates.

The site should describe what I have done rather than advertise what I aspire to become.

## 3. Proposed information architecture

Use the following navigation:

| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Positioning, career overview, accomplishments |
| Leadership | `/leadership/` | People management, organizational design and delivery leadership |
| Technical Work | `/work/` | Architecture, implementation and technical case studies |
| About | `/about/` | Career progression, working philosophy and personal background |
| Resume | `/resume/` | Role-specific resumes when available |

Retain the existing `/work/` route to avoid breaking links.

Navigation labels should be concise. Keep the current visual language and responsive layout.

Do not add empty sections or broken resume-download links.

## 4. Homepage redesign

The homepage must communicate the breadth of my experience within the first screen or two.

### 4.1 Hero

Include:

- Name: Lucas Sant' Anna
- A single headline representing both architecture and engineering leadership
- A short introduction describing experience and career progression
- Location: Metro Vancouver, Canada
- Clear links to Leadership and Technical Work
- LinkedIn as the primary contact method

The hero should not contain two competing headlines, one for Engineering Manager and another for Principal Engineer.

### 4.2 Evidence of impact

Immediately after the introduction, show a compact section with four representative results.

| Figure | Description |
|---|---|
| 10 engineers | Team led at Fortis Games |
| ~10M monthly users | Scale of the Prodigy Education platform |
| 2 days → 30 seconds | Infrastructure environment provisioning at Fortis |
| 35% reduction | Cloud infrastructure cost reduction at Prodigy |

Keep the employer and context visible.

These should be evidence of different dimensions of my career, rather than decorative counters or animated statistics.

Only use metrics that are verified in the repository or supplied career material. Do not create additional numbers.

### 4.3 Two areas of work

Introduce two equal-weight sections.

**Engineering Leadership**

Describe my experience building and managing teams, developing engineers, establishing practices, delegating technical ownership and improving delivery.

Link to `/leadership/`.

**Platform Architecture**

Describe my work designing and implementing Kubernetes platforms, cloud infrastructure, distributed systems, automation and production migrations.

Link to `/work/`.

Both should be visible without making the visitor choose one identity.

### 4.4 Selected work

Display a balanced selection of management and technical case studies.

Suggested order:

1. Building DevOps Engineering at Fortis (leadership)
2. Kubernetes Platform Architecture (technical)
3. Building an Infrastructure Support Rotation (leadership)
4. Infrastructure Automation with an Agent (technical)

Each preview should show:

- Problem addressed
- My responsibility or contribution
- Outcome, where supported
- Link to the full case study

Do not prioritize every case study using one global numerical weight. The homepage should intentionally include both leadership and architecture examples.

The current implementation only displays the first three featured cases. This needs to change.

### 4.5 Career progression

Add a short career overview emphasizing:

**Software Engineer → Technical Lead → Principal Engineer → Senior Engineering Manager**

This represents the progression of responsibilities, rather than a replacement of technical expertise with management.

It does not need to be an elaborate interactive timeline.

Link to About for the full employment history.

## 5. Leadership section

Create `/leadership/` as a first-class section with the same editorial quality as the technical case studies.

The purpose is to demonstrate how I lead engineering organizations and how my leadership responsibilities developed over time.

### 5.1 Case study: Building DevOps Engineering at Fortis

Suggested path:

`content/leadership/building-devops-engineering.md`

This should be the primary management case study.

Cover:

- The situation when I joined as infrastructure technical lead
- How the platform and engineering function developed
- My transition into formal people management
- Team structure and distributed collaboration
- Delegation through hands-on technical leads
- Hiring, coaching, performance management and career development
- Establishing technical decision processes
- Prioritization and balancing operations against engineering projects
- What I learned as a manager

Describe the approximately ten-person team and its areas of responsibility: SRE, CI/CD, compute/platform and AI infrastructure, with the historical organizational details checked for accuracy.

Explain the transition from making many technical decisions personally toward giving technical leads clearer ownership.

Do not invent hiring counts, promotion outcomes, retention statistics or delivery metrics.

Where outcomes cannot be quantified, use factual descriptions of the operating model and observed effects.

### 5.2 Case study: Infrastructure Support Rotation

Reuse the existing:

`content/work/support-engineering-rotation.md`

This is already one of the more detailed management-oriented case studies.

Make it available within the Leadership section. Prefer moving it with a Hugo alias preserving its original URL, or another clean implementation that avoids duplicate pages and duplicate canonical URLs.

Retain its meaningful content:

- Problem of unmanaged interrupts
- Knowledge concentrated in specialists
- Weekly support ownership
- Operational workflow and handoffs
- Trade-offs in capacity and specialization
- Limitations of the evidence collected

Preserve the author's acknowledgment that improvements in requester satisfaction were observed but not measured.

This is an important example of organizational design, even though it is not a people-management case study in the narrow sense.

### 5.3 Case study: Leading Platform Delivery

Suggested path:

`content/leadership/leading-platform-delivery.md`

Use the game incubator and infrastructure onboarding project as the basis.

Focus on the leadership questions:

- Why infrastructure provisioning was a business bottleneck
- How the team's priorities were established
- How IT dependencies affected delivery
- How standardization and automation changed platform throughput
- How engineering work was coordinated with product teams
- How technical ownership and implementation were divided

Link to the existing infrastructure-agent case study for architectural detail.

Do not invent personnel responsibilities or planning decisions.

If there is insufficient verified material to publish a reliable case study, keep this as a draft and omit it from navigation and homepage previews.

### 5.4 Leadership philosophy

Include a short section about how I approach management, grounded in my actual practices.

Relevant themes:

- Delegating decisions to technical leaders
- Providing context and guardrails
- Clear service ownership and accountability
- Writing down technical decisions
- Developing engineers while maintaining technical standards
- Reducing dependence on individual specialists

Avoid a generic list of management values. Use specific examples wherever possible.

## 6. Technical Work section

Retain `/work/` and its existing case-study framework.

This should remain technically detailed. Principal Engineer hiring managers need evidence of architectural judgment, engineering depth and implementation experience.

Keep the existing cases:

- Kubernetes Platform Architecture
- Infrastructure Automation with an Agent
- Consolidating 38 AWS Accounts Without Losing Cost Visibility
- Zero-Downtime Migration from ECS to EKS (currently a draft)

Preserve architectural diagrams, constraints, decisions, alternatives, trade-offs and lessons.

### Technical case-study structure

Standardize around:

1. Context and problem
2. Constraints and scale
3. My responsibility and contribution
4. Architecture and decisions
5. Alternatives and trade-offs
6. Implementation, when applicable
7. Results
8. Lessons and limitations

Do not force every case study to contain empty or repetitive sections.

Make my contribution explicit: what I personally designed, wrote or implemented, and what engineers on the team delivered.

Keep diagrams technically accurate and avoid adding inferred systems, connections or infrastructure details.

### Important content check

The infrastructure-agent case currently refers to Claude Code as the MCP client used in practice.

Review this wording for factual accuracy. My personal AI development workflow uses Oh My Pi across multiple models, including OpenAI/Codex, potentially Claude and open-source models. Do not claim that Claude Code is my daily tool.

Also keep architectural descriptions precise. Avoid expanding technical claims beyond what the case study supports.

## 7. About page

Reorganize `content/about.md`.

The existing page contains useful information but reads as separate descriptions of management and hands-on engineering.

Replace that structure with a chronological and thematic narrative.

### Recommended sections

**Background**

Briefly cover my experience in backend engineering, distributed systems, AWS and Kubernetes.

**From technical leadership to engineering management**

Explain how I progressed from architecture and technical leadership responsibilities to building and managing an engineering function.

Include relevant experience at Receptiviti, Prodigy, Wrapbook, ChatFood and Fortis, with appropriate distinctions between formal management and technical leadership.

**How I work**

Discuss architectural judgment, operating models, engineering ownership and delegation, with real examples.

**Career history**

Retain the existing chronological list of employers, positions and dates. Verify the titles and dates against the current source material before changing them.

**Outside work**

Retain the personal section about boxing, CrossFit, homelab projects, music, family and other interests. Keep its current informal tone.

Avoid restating the full homepage or duplicating the Leadership section.

## 8. Resume section

Create a simple `/resume/` page with two clearly named versions:

**Engineering Manager Resume**

Emphasizes people management, team building, technical leadership and delivery through others.

**Principal Engineer Resume**

Emphasizes architecture, technical depth, implementation, systems ownership and cross-team influence.

Both versions must reflect the same career history.

Do not generate or rewrite the resumes as part of this task.

If the actual PDF files have not been supplied, implement the section so it can be enabled later without publishing broken links or dummy PDFs.

Provide clear external links to LinkedIn and GitHub.

## 9. Visual design requirements

Preserve the existing design system.

The current website uses a custom Hugo theme with CSS variables, responsive layouts, light/dark themes, custom diagrams and relatively restrained typography.

Avoid a full visual redesign unless required to support the information architecture.

Do not introduce:

- Large decorative hero images
- Stock photography
- Excessive animation
- Circular skills charts or proficiency bars
- Arbitrary progress indicators
- An Engineering Manager / Principal Engineer mode switch
- Corporate-style buzzwords or marketing slogans
- A new JavaScript framework or build system

The site should feel like an experienced engineer's personal website.

Optimize the hierarchy, navigation, density and readability.

### Responsive behavior

Verify layouts at approximately 390px mobile width, tablet width and desktop width.

Case-study titles, metrics and navigation must remain usable on smaller screens.

Currently the case-study factsheet hides contribution and responsibility details behind a collapsed section on mobile. Make the role and outcome visible without requiring interaction.

Maintain keyboard accessibility, proper heading order and sensible focus states.

## 10. Implementation notes

The current project has these relevant files:

| File | Responsibility |
|---|---|
| `hugo.toml` | Site metadata, headline and description |
| `content/_index.md` | Homepage introductory content |
| `content/about.md` | About and career history |
| `content/work/` | Technical case studies |
| `layouts/home.html` | Homepage layout |
| `layouts/_partials/header.html` | Navigation |
| `layouts/_partials/case-preview.html` | Case-study previews |
| `layouts/work/page.html` | Case-study detail template |
| `layouts/work/section.html` | Technical Work index |
| `assets/css/main.css` | Design tokens and primary styles |

Add new templates or partials where appropriate. Reuse shared components rather than duplicating case-study rendering logic.

Keep the architecture diagram shortcodes and existing assets.

Maintain backwards-compatible URLs. Use Hugo aliases or explicit redirects when moving published pages.

Check the canonical domain configuration: `hugo.toml` currently sets `https://lucassantanna.ca/`. Verify whether `.ca` or `.com` should be canonical before changing SEO metadata. Do not assume both domains are configured identically.

Update page titles, descriptions and structured metadata to match the revised positioning without keyword stuffing.

## 11. Content accuracy and editorial standards

The website should use my writing style: technical, straightforward, specific and occasionally personal.

Use the existing case-study writing as a reference for tone.

Rules:

- No fabricated facts or quantified results.
- No inflated management experience.
- No unverified claims about individual authorship.
- Preserve distinctions between "I designed", "I implemented", "I led" and "my team delivered".
- Do not turn a documented plan or proof of concept into a completed result.
- Do not present management processes as having measurable impact unless that impact was measured.
- Preserve relevant limitations and lessons learned.
- Avoid corporate language and generic statements.
- Do not repeat the same achievements across every page.
- Prefer a clear explanation of a specific decision over broad statements about engineering excellence.

Keep the voice human. The website should not read like a cover letter.

## 12. Acceptance criteria

The task is complete when:

- [ ] The homepage clearly establishes both engineering leadership and technical depth.
- [ ] The new headline and introductory content accurately represent my career.
- [ ] Leadership is accessible from the main navigation.
- [ ] Technical Work remains accessible at `/work/`.
- [ ] At least one substantial, evidence-backed management case study is published.
- [ ] Existing technical case studies and diagrams are preserved.
- [ ] The support-rotation case study is visible under Leadership.
- [ ] The homepage presents a deliberate mix of leadership and technical work.
- [ ] The About page communicates my career progression clearly.
- [ ] The Resume section supports two separate versions without broken links.
- [ ] Case-study responsibility and outcome information are visible on mobile.
- [ ] Existing published URLs continue to work.
- [ ] The responsive layout and light/dark themes remain functional.
- [ ] Page metadata and canonical URLs are consistent.
- [ ] The Hugo production build succeeds.
- [ ] No unsupported professional claims or invented metrics have been introduced.

## 13. Validation and delivery

Run the production build:

```bash
hugo --gc --minify
```

Verify the website locally using the existing development command:

```bash
hugo server
```

Inspect the homepage, Leadership, Technical Work, About and Resume pages at mobile and desktop widths.

Check internal links, navigation, metadata, dark mode, heading hierarchy and case-study layouts.

If browser-based visual testing is available, capture before-and-after screenshots of the homepage and representative detail pages.

### Deliverables

1. Implementation in a feature branch.
2. Updated homepage, navigation and content structure.
3. New Leadership section with verified case-study content.
4. Revised About page.
5. Resume page with appropriate handling of unavailable files.
6. Summary of changed files.
7. List of factual assumptions or content requiring my verification.
8. Screenshots or a local preview where possible.

Do not merge or deploy without review.

## 14. Priority and scope

Implement in this order:

**Priority 1: Positioning and homepage**

Correct the headline, introduction, career presentation and balance between leadership and technical work.

**Priority 2: Leadership section**

Publish the Fortis engineering-management case study and surface the support rotation.

**Priority 3: About and navigation**

Reorganize the existing biography and update navigation.

**Priority 4: Case-study presentation**

Improve contribution visibility, cross-linking and consistent templates.

**Priority 5: Resume integration and SEO**

Add resume access, verify canonical domains and finalize metadata.

Avoid spending time on cosmetic refinements before the content architecture is correct.

### Final intent

A recruiter evaluating me for an Engineering Manager position should find clear evidence that I have built and led an engineering team, managed engineers, delegated technical ownership and improved the way engineering work gets done.

A hiring manager evaluating me for Principal Engineer should find strong evidence of architecture ownership, technical judgment, implementation experience and experience leading technically across teams.

Both should recognize the same person, with a consistent career history and a credible progression of responsibility.

The end result should present my full experience without exaggerating either side.
