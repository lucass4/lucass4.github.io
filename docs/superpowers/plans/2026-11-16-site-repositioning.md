# Site Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition lucassantanna.ca so one visitor sees both an engineering leader who built and ran a ten-person function and a principal engineer who designed the platform underneath it.

**Architecture:** Hugo, no new tooling. `/work/` keeps its templates; a new `/leadership/` section reuses them by setting `type: case` on both section front matters so one template set (`layouts/case/`) renders every case study. The home page stops deriving featured work from `weight` and reads an explicit ordered list from `hugo.toml`. New home-page blocks (impact figures, the two areas of work, the progression line) are CSS grids built from `content/_index.md` front matter.

**Tech Stack:** Hugo 0.169 extended, plain CSS (`assets/css/main.css`), no JS additions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-16-site-repositioning.md`

## Global Constraints

- Hugo 0.169+. No Node step, no npm, no new JavaScript, no new dependency.
- Verification is `hugo --gc --minify` plus greps over `public/`. There is no test framework in this repo and this plan does not add one.
- Preserve the existing design system: tokens in `assets/css/main.css`, light default plus `prefers-color-scheme` dark plus `[data-theme]` override.
- Forbidden visuals: hero images, stock photography, animated counters, skill bars, progress indicators, an EM/PE mode switch.
- Content accuracy, non-negotiable: no fabricated facts or numbers; preserve the distinction between "I designed", "I implemented", "I led" and "my team delivered"; no proof of concept presented as a result; no management process presented as measured unless it was measured; keep stated limitations.
- Never invent: hiring counts, promotion outcomes, retention or attrition figures, delivery velocity, satisfaction scores, 1:1 cadence, performance-review mechanics. None of these are verified anywhere in this repo.
- Preserve actual titles and dates exactly as `content/about.md:71-83` lists them. The current title is `Sr. Manager, DevOps Engineering` (Mar 2026 – present), not "Senior Engineering Manager".
- Do not describe Lucas as Director, VP or CTO. Do not imply 18 years of management. Do not describe him as only an IC.
- Published URLs must keep working. Moving a published page requires `aliases` in its front matter.
- Verified fact inventory for new prose (nothing outside this list, except what the spec supplies directly):
  - `content/about.md`: ten engineers through four area leaders (CI/CD, SRE, platform, AI infrastructure); Brazil, Portugal, England, Canada, an eight-hour spread; he wrote the RFC and ADR process, the service ownership model and the incident management model; nine distributed engineers managed at ChatFood through an AWS and Kubernetes migration; technical lead for four engineers at Wrapbook; ~10M monthly users and 150k+ concurrent at Prodigy; Karpenter migration with upstream contribution; Flux v1 to ArgoCD with no downtime; Kafka/Kafka Streams at Receptiviti; became part of the critical path earlier in his career and built decision processes as a correction.
  - `content/work/support-engineering-rotation.md`: roster started at eight engineers and grew to ten; one week in ten; fixed priority order (requests, monitoring and Argo CD, Renovate, project work); envelope-reaction ticket capture in one operations channel; Friday handoff in the existing team meeting; requester satisfaction improved but was never measured; kagent stayed a proof of concept.
  - `content/work/kubernetes-platform-architecture.md` and `content/work/infrastructure-agent.md`: Fortis had no internal platform; zero-downtime ECS to EKS cutovers; 2 days → 30 seconds; 50 environments in three months; ~12 cents per run warm.
  - From the spec's supplied career material: 35% cloud infrastructure cost reduction at Prodigy. Used once, on the home page, and listed for Lucas to confirm.

## Review Focus

- `/work/support-engineering-rotation/` is a published URL. Moving the file must leave that path serving the page, not a 404 — Task 2 greps the alias output.
- `content/work/zero-downtime-ecs-to-eks.md` is `draft: true`. The home page's explicit featured list must tolerate a path that resolves to nothing in a production build — Task 4 guards every lookup with `with` and builds without `-D` to prove it.
- The header gains two nav entries. At 390px the nav wraps onto its own row (`@media (max-width: 34rem)` in `assets/css/main.css:330`); six items plus the theme toggle must still fit and stay tappable — Task 5 checks it.
- Removing the factsheet `<details>` changes keyboard behaviour and desktop layout. The `<dl>` must still be two columns above 40rem and must not leave an orphan `@supports selector(details::details-content)` rule behind — Task 1 greps the built HTML for the summary element and the CSS for the dead block.
- A new section inherits `[outputs] section = ["html", "rss"]`. `/leadership/index.xml` and the sitemap entry must build, and the section must not be empty in production — Task 2 checks both.

---

### Task 1: One case-study template set, factsheet always visible

**Files:**
- Move: `layouts/work/page.html` → `layouts/case/page.html`
- Move: `layouts/work/section.html` → `layouts/case/section.html`
- Modify: `layouts/_partials/case-preview.html`
- Modify: `content/work/_index.md` (front matter)
- Modify: `assets/css/main.css:834-885` (delete), plus a `.case__role` rule in the case-studies block
- Modify: `README.md` (the front-matter table and the "collapsed on mobile" sentence)

**Interfaces:**
- Produces: `layouts/case/page.html` and `layouts/case/section.html`, selected by `type: case`. Any section whose `_index.md` sets `type: case` and `cascade: {type: case}` renders case studies. Task 2 relies on this for `/leadership/`.
- Produces: `case-preview.html` renders `.Params.role` as `.case__role`. Task 4 relies on it for the home page previews.

- [ ] **Step 1: Move the two templates**

```bash
mkdir -p layouts/case
git mv layouts/work/page.html layouts/case/page.html
git mv layouts/work/section.html layouts/case/section.html
rmdir layouts/work
```

- [ ] **Step 2: Make the kicker section-relative in `layouts/case/page.html`**

The kicker currently hardcodes `site.GetPage "/work"`. Replace that anchor with the page's own `.CurrentSection`, using `.LinkTitle` for the label, so a leadership case study says "Leadership" and links to `/leadership/`.

- [ ] **Step 3: Replace the `<details>` factsheet with the bare `<dl>` in `layouts/case/page.html`**

Drop the `<details class="factsheet-wrap">` wrapper and its `<summary>`; keep the `<dl class="factsheet">` and its four conditional rows (`role`, `scale`, `outcome`, `stack`) exactly as they are. Update the template comment above it to say role, scale, outcome and stack are always visible because the role is the point of the page.

- [ ] **Step 4: Add the role line to `layouts/_partials/case-preview.html`**

After the `.case__problem` block and before `.case__metric`, render `.Params.role` as `<p class="case__role mono">`. Guard it with `with` like the neighbouring blocks. Update the partial's header comment: `role` now appears in previews, `outcome` and `stack` still do not.

- [ ] **Step 5: Set the shared type on the work section**

In `content/work/_index.md` front matter add `linkTitle: "Technical Work"`, `type: "case"` and:

```yaml
cascade:
  type: "case"
```

- [ ] **Step 6: CSS — delete the collapsible block, style the role line**

Delete `assets/css/main.css:834-885` in full: the `.factsheet-wrap*` rules and the `@media (min-width: 48rem)` / `@supports selector(details::details-content)` block that reopened it. Add to the case-studies section:

```css
.case__role {
  margin-top: var(--space-3);
  color: var(--text-dim);
  font-size: var(--step--1);
  max-width: var(--measure);
}
```

- [ ] **Step 7: Build and verify**

```bash
hugo --gc --minify
grep -c 'factsheet-wrap' public/work/kubernetes-platform-architecture/index.html   # expect 0
grep -c 'class="factsheet"' public/work/kubernetes-platform-architecture/index.html # expect 1
grep -o 'case__role' public/work/index.html | head -1                               # expect case__role
grep -c 'factsheet-wrap' assets/css/main.css                                        # expect 0
```

Expected: build succeeds with no template warnings; all four greps as annotated; `/work/` still lists five case studies (four in production).

- [ ] **Step 8: Commit**

```bash
git add layouts/case layouts/_partials/case-preview.html content/work/_index.md assets/css/main.css README.md
git commit -m "refactor: share case-study templates by type, uncollapse the factsheet"
```

---

### Task 2: Leadership section, with the support rotation moved into it

**Files:**
- Create: `content/leadership/_index.md`
- Move: `content/work/support-engineering-rotation.md` → `content/leadership/support-engineering-rotation.md`
- Modify: the moved file's front matter (`weight`, `aliases`, drop `featured`)

**Interfaces:**
- Consumes: `type: case` cascade from Task 1.
- Produces: `/leadership/` section index and `/leadership/support-engineering-rotation/`, with `/work/support-engineering-rotation/` aliased to it. Task 4 links to both paths.

- [ ] **Step 1: Create the section index**

`content/leadership/_index.md`, front matter: `title: "Leadership"`, `linkTitle: "Leadership"`, `type: "case"`, `cascade: {type: "case"}`, `weight: 1`, and a `description` naming engineering management, organisational design and delivery leadership without repeating the home page's wording.

Body: two or three sentences in the voice of `content/work/_index.md` — what this section covers (building and running the DevOps Engineering function at Fortis, and the operating models that came out of it) and that each case study states what he decided, what he delegated and what he cannot show.

Then one short paragraph standing in for spec §5.4's leadership philosophy, stated as practice rather than values: decisions delegated to area leads, context and guardrails before answers, written-down technical decisions, service ownership that names who is accountable, and a rotation built so no area stays one person's private knowledge. Each clause must point at the thing that implements it — the RFC and ADR process, the service ownership model, the support rotation — not at an abstraction. No bulleted list of management values.

- [ ] **Step 2: Move the support rotation**

```bash
git mv content/work/support-engineering-rotation.md content/leadership/support-engineering-rotation.md
```

- [ ] **Step 3: Alias the old URL and reorder**

In the moved file's front matter: add `aliases: ["/work/support-engineering-rotation/"]`, set `weight: 2`, and delete `featured: true` (Task 4 removes the flag's only consumer). Change nothing in the body — the unmeasured-satisfaction paragraph and the kagent proof-of-concept paragraph stay exactly as written.

- [ ] **Step 4: Build and verify the alias, the feed and the sitemap**

```bash
hugo --gc --minify
test -f public/leadership/support-engineering-rotation/index.html && echo page-ok
grep -c 'url=/leadership/support-engineering-rotation/' public/work/support-engineering-rotation/index.html  # expect 1
test -f public/leadership/index.xml && echo rss-ok
grep -c '<loc>.*leadership/</loc>' public/sitemap.xml   # expect 1
grep -c 'Leadership' public/leadership/support-engineering-rotation/index.html  # expect >=1, the kicker
```

Expected: `page-ok`, `rss-ok`, the alias redirect present at the old path, one sitemap entry, kicker reading Leadership.

- [ ] **Step 5: Commit**

```bash
git add content/leadership content/work
git commit -m "feat: add leadership section, move support rotation with alias"
```

---

### Task 3: Fortis engineering-management case study

**Files:**
- Create: `content/leadership/building-devops-engineering.md`
- Modify: `content/leadership/support-engineering-rotation.md` (one cross-link)

**Interfaces:**
- Produces: `/leadership/building-devops-engineering/`, `weight: 1` in the section. Task 4's featured list points at it.

- [ ] **Step 1: Write the front matter**

Exact keys and values:

```yaml
title: "Building DevOps Engineering at Fortis"
weight: 1
metric: "10 engineers"
metric_note: "four areas, four countries"
problem: "Fortis had no platform function. I joined as infrastructure technical lead to build the platform, and the engineering function that would own it had to be built alongside it."
role: "Built the function, then moved into managing it: four area leads, the decision processes, the operating model"
scale: "Ten engineers across Brazil, Portugal, England and Canada, an eight-hour spread"
outcome: "Area leads own their technical decisions; the RFC, ADR, service ownership and incident models are what they decide against"
stack: ["RFC", "ADR", "Service ownership model", "Incident management", "Kanban"]
description: "Building and then leading DevOps Engineering at Fortis Games: how a platform technical lead role became a ten-person function, and the decision processes that let it run without routing through one person."
```

- [ ] **Step 2: Write the body**

H2 sections, in this order. Every factual claim must trace to the Global Constraints fact inventory; prose style follows `content/work/support-engineering-rotation.md` — short paragraphs, concrete, first person, no corporate register.

1. **What was there when I joined** — Jan 2024, Principal Software Engineer and Infrastructure Technical Lead, no internal platform. Link to `/work/kubernetes-platform-architecture/` for the architecture rather than re-describing it.
2. **The function grew before the title did** — platform work created permanent operational ownership; areas emerged (CI/CD, SRE, platform, AI infrastructure); formal move to Sr. Manager, DevOps Engineering in Mar 2026. State plainly that he was leading the function's technical direction before the management title, and that the title changed what he was accountable for, not what the team did.
3. **Four areas, four leads** — the four areas and that each has a lead; the eight-hour spread across four countries; what that rules out (synchronous decisions, one person as the bottleneck).
4. **Delegating decisions, not tasks** — the correction he is explicit about on the About page: he had gone deep enough to become part of the critical path. The RFC and ADR process, the service ownership model and the incident management model exist so engineers decide without him. Say what each one settles: RFC/ADR that an argument happens in writing and stays findable, service ownership what platform owes product teams versus what they own, incident management who holds an incident. Do not claim an improvement figure for any of them.
5. **Operations against projects** — the support rotation as the prioritisation mechanism, with its fixed priority order and the roughly ten percent of capacity that cost. One-sentence summary plus a link to `/leadership/support-engineering-rotation/`; do not restate the case study.
6. **Managing engineers before Fortis** — nine distributed engineers at ChatFood through an AWS and Kubernetes migration; technical lead for four engineers at Wrapbook. Label which was people management and which was technical leadership.
7. **What I would do differently** — mirrors the rotation's closing honesty: the operating model changes he can describe and cannot measure, and the measurements that were available and not taken (request volume, time to acknowledge). No new claims.

Omit hiring, coaching, performance management and career development entirely. The spec asks for them; nothing in this repository verifies a single detail, and Global Constraints forbids inventing them. Flag this in the handoff so Lucas can supply the material.

- [ ] **Step 3: Cross-link from the rotation**

In `content/leadership/support-engineering-rotation.md`, in the "My role" section, add one sentence linking `/leadership/building-devops-engineering/` as the wider context for the team the rotation ran in. One sentence, no restatement.

- [ ] **Step 4: Build and verify**

```bash
hugo --gc --minify
test -f public/leadership/building-devops-engineering/index.html && echo page-ok
grep -c 'leadership/support-engineering-rotation' public/leadership/building-devops-engineering/index.html  # expect >=1
grep -ci 'visionary\|transformation\|passionate\|empower\|synergy\|world-class' public/leadership/building-devops-engineering/index.html  # expect 0
grep -ci 'director\|VP of\|CTO' public/leadership/building-devops-engineering/index.html  # expect 0
```

Expected: `page-ok`, the cross-link present, both banned-register greps returning 0.

- [ ] **Step 5: Commit**

```bash
git add content/leadership
git commit -m "feat: publish the Fortis engineering-management case study"
```

---

### Task 4: Home page — positioning, impact, two areas, deliberate featured mix

**Files:**
- Modify: `content/_index.md` (front matter and lede)
- Modify: `hugo.toml` (`params.headline`, `params.description`, new `params.featured`)
- Modify: `layouts/home.html`
- Modify: `assets/css/main.css` (new `Home page impact and areas` block before the closing block)
- Modify: `README.md` (document `params.featured`, `impact`, `areas`; remove the `featured` front-matter row)

**Interfaces:**
- Consumes: `.case__role` from Task 1; `/leadership/building-devops-engineering/` and `/leadership/support-engineering-rotation/` from Tasks 2 and 3.
- Produces: `site.Params.featured`, an ordered list of content paths; `impact` and `areas` lists in `content/_index.md` front matter.

- [ ] **Step 1: Keep the headline, replace the lede**

`hugo.toml`'s `params.headline` already carries both halves of the positioning — "I design platforms and lead the teams that build them." It is one headline, in his register, and satisfies §4.1 without churn. **Deliberate deviation from the spec's suggested headline; leave it unchanged** and record it in the handoff.

Rewrite the body of `content/_index.md` as two short paragraphs covering: eighteen years on backend and distributed systems, the last nine on AWS; principal engineer and infrastructure architecture ownership across several companies; most recently built and then led DevOps Engineering at Fortis. Second paragraph: the work covers the systems and the function that runs them. Keep it under about sixty words — the impact figures come next and the hero must not push them past the first screen.

Update `params.description` in `hugo.toml` to name engineering leadership and platform architecture, in one sentence, no keyword list.

- [ ] **Step 2: Add the impact and areas data to `content/_index.md` front matter**

```yaml
impact:
  - figure: "10 engineers"
    note: "Team led at Fortis Games"
  - figure: "~10M monthly users"
    note: "Platform scale at Prodigy Education"
  - figure: "2 days → 30 seconds"
    note: "Environment provisioning at Fortis"
  - figure: "35% reduction"
    note: "Cloud infrastructure cost at Prodigy"
areas:
  - title: "Engineering Leadership"
    href: "/leadership/"
    body: "<one or two sentences: building the function, four area leads owning their decisions, written decision processes, protecting project time from interrupts>"
  - title: "Platform Architecture"
    href: "/work/"
    body: "<one or two sentences: Kubernetes platforms designed end to end, AWS, zero-downtime production migrations, provisioning automation>"
```

Write the two `body` values in his voice. No overlap with the lede's wording.

- [ ] **Step 3: Replace the featured-work selection in `hugo.toml`**

```toml
  # The home page's selected work, in order. Deliberately mixed: leadership,
  # architecture, leadership, architecture. A `weight` across one section
  # cannot express that.
  featured = [
    "/leadership/building-devops-engineering",
    "/work/kubernetes-platform-architecture",
    "/leadership/support-engineering-rotation",
    "/work/infrastructure-agent",
  ]
```

Then delete `featured: true` from `content/work/aws-multi-account-cost-attribution.md`, `content/work/infrastructure-agent.md`, `content/work/kubernetes-platform-architecture.md` and `content/work/zero-downtime-ecs-to-eks.md`. Nothing reads the flag after this task.

- [ ] **Step 4: Rewrite `layouts/home.html`**

Section order: hero, impact, areas, selected work, progression, writing (unchanged), closing (unchanged).

- Hero: unchanged markup, plus a second button. Primary stays `/work/` as "Technical work"; add a `btn btn--primary` for `/leadership/` as "Engineering leadership"; LinkedIn stays `btn btn--ghost`. Wrap each internal link in `with site.GetPage`.
- Impact: `<section class="section section--impact">` labelled by an `h2` reading "Evidence", rendering `.Params.impact` as `<ul class="impact">` with `<li>` carrying `<span class="impact__figure">` and `<span class="impact__note mono">`. Figures are static text, no counters.
- Areas: `<section class="section">` with an `h2` "Two sides of the same work", rendering `.Params.areas` as a two-column grid of `<div class="area">` — `h3` linking `href`, paragraph `body`, and a `link-arrow` to the same destination.
- Selected work: range `site.Params.featured`, `with site.GetPage .` each, render through `partial "case-preview.html" (dict "page" . "level" 3)`. The `with` guard is what keeps the draft ECS-to-EKS page, or a future typo, from breaking the build. Keep the `section__more` link to `/work/`, and add one to `/leadership/`.
- Progression: a single `<p class="progression mono">` reading `Backend engineer → principal engineer → infrastructure technical lead → senior manager, DevOps Engineering`, followed by one sentence saying the technical work did not stop at any step, and a `link-arrow` to `/about/` for the full history. Real titles only, from `content/about.md:71-83`.

- [ ] **Step 5: CSS for the three new blocks**

Add one commented block before `Home page closing block`. `.impact` is a `grid` with `gap: var(--space-5)`, two columns at 30rem, four at 60rem; `.impact__figure` reuses the `.case__metric-figure` treatment (`var(--step-2)`, weight 600, `var(--accent)`, `tabular-nums`) as a `display: block`; `.impact__note` is `var(--text-dim)` at `var(--step--1)`. `.areas` is a grid, one column, two at 48rem, `gap: var(--space-7)`. `.progression` is `var(--text-dim)`, wraps at 390px (no `white-space: nowrap`). No animation, no borders around figures, no cards.

- [ ] **Step 6: Build and verify**

```bash
hugo --gc --minify
grep -c 'class="impact"' public/index.html            # expect 1
grep -c 'impact__figure' public/index.html            # expect 4
grep -c 'class="case"' public/index.html              # expect 4
grep -c 'leadership/building-devops-engineering' public/index.html  # expect >=1
grep -c 'zero-downtime' public/index.html             # expect 0
grep -c 'case__role' public/index.html                # expect 4
```

Expected: build succeeds with no "page not found" warning for the draft path; four impact figures; four case previews each carrying a role line; the draft absent.

- [ ] **Step 7: Commit**

```bash
git add hugo.toml content/_index.md content/work layouts/home.html assets/css/main.css README.md
git commit -m "feat: reposition the home page around leadership and architecture"
```

---

### Task 5: Navigation and About

**Files:**
- Modify: `layouts/_partials/header.html`
- Modify: `content/about.md`

**Interfaces:**
- Consumes: `/leadership/` from Task 2, `linkTitle: "Technical Work"` from Task 1.
- Produces: nav order Leadership, Technical Work, About, Resume, LinkedIn. Task 6 adds the Resume entry to the same list.

- [ ] **Step 1: Add Leadership to the derived nav**

In `header.html`, change the section slice from `slice "work" "writing"` to `slice "leadership" "work" "writing"`. The existing `if .RegularPages` guard already keeps an empty section out, so no other change is needed.

- [ ] **Step 2: Restructure `content/about.md`**

Keep every sentence that is still true; this is a reorganisation, not a rewrite. Section order and content:

- Opening: two or three sentences, positioning without repeating the home page lede verbatim.
- **Background** — the pre-Kubernetes distributed-systems material currently in "Hands on" (Kafka and Kafka Streams at Receptiviti, RabbitMQ and Java APIs at NS90, Grupo Mult integrations), plus the AWS and Kubernetes years.
- **From technical leadership to engineering management** — merges the current "Leading the function" with the principal-engineer material: Receptiviti and Prodigy as principal-level architecture ownership, Wrapbook as technical lead for four engineers, ChatFood as people management of nine, Fortis as technical lead then manager of ten. Label each as formal management or technical leadership. One link each to `/leadership/building-devops-engineering/` and `/work/kubernetes-platform-architecture/` instead of re-describing them.
- **How I work** — the current "How I think about the work", kept nearly verbatim: a platform is an architecture plus an operating model; context and guardrails before answers; the critical-path correction; cost, latency, throughput, request-to-running-environment. Keep the oh-my-pi sentence here.
- **Career** — the existing `<ul class="timeline">` and the Education block, unchanged, titles and dates untouched.
- **Outside work** — unchanged, including tone.
- **Contact** — unchanged.

Update `preview` in the front matter if the reorganisation makes it stale; keep `description` accurate to the revised page.

- [ ] **Step 3: Build and verify nav and heading order**

```bash
hugo --gc --minify
grep -o 'site-nav.*</nav>' public/index.html | grep -o '>[A-Za-z ]*</a>' | head -8
grep -o '<h[1-3][^>]*>' public/about/index.html | head -12
```

Expected: nav links in order Leadership, Technical Work, About, LinkedIn (Resume arrives in Task 6); About's headings are one `h1` then `h2`s with the `h3` only under Career, no skipped level.

- [ ] **Step 4: Check the nav at 390px**

```bash
hugo server
```

Load `http://localhost:1313/` at 390px wide. Confirm the nav wraps to its own row, every item is on one or two lines with no horizontal scroll, and the theme toggle is still reachable. Then confirm `aria-current` marks Leadership when on a leadership page.

- [ ] **Step 5: Commit**

```bash
git add layouts/_partials/header.html content/about.md
git commit -m "feat: add leadership to the nav, restructure the about page"
```

---

### Task 6: Resume page

**Files:**
- Create: `content/resume.md`
- Modify: `layouts/_partials/header.html`

**Interfaces:**
- Consumes: the generic `layouts/page.html` (no new template).
- Produces: `/resume/` and its nav entry.

- [ ] **Step 1: Write `content/resume.md`**

Front matter: `title: "Resume"`, `linkTitle: "Resume"`, and a `description` naming the two versions.

Body: one short paragraph saying both versions describe the same career and differ only in emphasis; then an `h2` for **Engineering Manager** and an `h2` for **Principal Engineer**, two or three sentences each on what that version leads with; then a closing paragraph pointing at LinkedIn for the current version and GitHub for code, with both links. No PDFs have been supplied, so the page publishes no download link rather than a placeholder.

Add an HTML comment above the two headings recording how to enable downloads later — drop the PDF in `static/`, add one markdown link under its heading — and mark it `ponytail:` as a deliberate omission: file-existence template logic for two files that do not exist buys nothing a one-line markdown edit cannot.

- [ ] **Step 2: Add the nav entry**

In `header.html`, after the About entry, add a Resume entry in the same shape: `with site.GetPage "/resume"`, same `aria-current` condition. Guarded by `with`, so deleting the page removes the link.

- [ ] **Step 3: Build and verify there are no broken links**

```bash
hugo --gc --minify
test -f public/resume/index.html && echo page-ok
grep -ci '\.pdf' public/resume/index.html        # expect 0
grep -c 'linkedin.com/in/lucassantanna' public/resume/index.html  # expect >=1
grep -o '>Resume</a>' public/index.html          # expect >Resume</a>
```

Expected: `page-ok`, no PDF reference anywhere on the page, LinkedIn present, nav entry rendered.

- [ ] **Step 4: Commit**

```bash
git add content/resume.md layouts/_partials/header.html
git commit -m "feat: add resume page with both versions described"
```

---

### Task 7: Factual accuracy pass on the infrastructure-agent case

**Files:**
- Modify: `content/work/infrastructure-agent.md:47,58,71`
- Modify: `assets/diagrams/infrastructure-agent.svg:22,27`

- [ ] **Step 1: Generalise the MCP client in the prose**

Line 47 reads "so an MCP client (Claude Code, in practice) calls a tool". Remove the parenthetical: the architectural claim is that any MCP client can call the tool, which is both accurate and stronger. Check lines 49 and 71 read correctly afterwards and change nothing else — no expanded claims about what the agent does.

- [ ] **Step 2: Generalise it in the diagram**

In the shortcode block, line 58's node is `[Request] MCP client*, Claude Code`. Replace the qualifier with a product-neutral one (for example `any MCP client`). In `assets/diagrams/infrastructure-agent.svg`, line 27's `an__sub` text and line 22's `aria-label` must match the new qualifier word for word, since the SVG and the card markup are two representations of the same node.

- [ ] **Step 3: Build and verify no Claude reference survives**

```bash
hugo --gc --minify
grep -rci 'claude' public/work/infrastructure-agent/index.html   # expect 0
grep -rci 'claude' content/ assets/diagrams/                     # expect 0
```

Expected: both greps return 0, and the SVG and card qualifiers are identical strings.

- [ ] **Step 4: Check the diagram still reads at both breakpoints**

With `hugo server`, open `/work/infrastructure-agent/` at 390px (cards) and above 60rem (SVG). Confirm the renamed node fits its box without overlapping its neighbour and the card text reads correctly.

- [ ] **Step 5: Commit**

```bash
git add content/work/infrastructure-agent.md assets/diagrams/infrastructure-agent.svg
git commit -m "fix: drop the Claude Code attribution from the agent case study"
```

---

### Task 8: Metadata, docs and the full-site check

**Files:**
- Modify: `layouts/_partials/head/schema.html:7`
- Modify: `README.md`

- [ ] **Step 1: Align the structured-data job title**

`schema.html` hardcodes `jobTitle: "Platform and Infrastructure Engineering Leader"`. Replace it with the current actual title, `Sr. Manager, DevOps Engineering`, and add `description` to the Person object reading from `site.Params.description`. Leave `baseURL` in `hugo.toml` as `https://lucassantanna.ca/`: there is no `static/CNAME` and no CNAME in the git history, so which domain GitHub Pages serves cannot be determined from this repository. Record it as an open question for Lucas instead of guessing.

- [ ] **Step 2: Update `README.md` to match the implementation**

The front-matter table (`README.md:64-89`) and the layout tree (`README.md:22-36`) are both stale after Tasks 1, 2, 4 and 6. Update: `layouts/case/` replaces `layouts/work/` and serves both sections; `content/leadership/` exists; the `featured` row becomes `params.featured` in `hugo.toml`; the "collapsed on mobile" sentence goes; `impact` and `areas` in `content/_index.md` are documented; `aliases` is named as the way to move a published page.

- [ ] **Step 3: Full production build and link check**

```bash
hugo --gc --minify
grep -rl 'href="/' public --include=index.html | head -1 >/dev/null
for p in / /leadership/ /work/ /about/ /resume/ /leadership/building-devops-engineering/ \
         /leadership/support-engineering-rotation/ /work/kubernetes-platform-architecture/ \
         /work/infrastructure-agent/ /work/aws-multi-account-cost-attribution/ \
         /work/support-engineering-rotation/; do
  test -f "public${p}index.html" && echo "ok   $p" || echo "MISS $p"
done
grep -c '<link rel="canonical"' public/leadership/building-devops-engineering/index.html  # expect 1
```

Expected: every path `ok`, including the aliased `/work/support-engineering-rotation/`; one canonical link per page; build output free of WARN lines.

- [ ] **Step 4: Responsive and theme check**

With `hugo server`, at 390px, ~768px and desktop, on `/`, `/leadership/`, `/work/`, `/about/`, `/resume/` and one case study of each type: confirm no horizontal scroll, role and outcome visible on the case study without interaction at 390px, the impact figures legible and wrapping two-up, keyboard tab order running header → skip link target → content, and both themes correct via the toggle and via `prefers-color-scheme`. Capture home-page and case-study screenshots at 390px and desktop into `.github/screenshots/`.

- [ ] **Step 5: Commit**

```bash
git add layouts/_partials/head/schema.html README.md .github/screenshots
git commit -m "docs: update readme and structured data for the new architecture"
```

---

## Handoff notes to collect during implementation

Carry these into the final summary; they are the spec's deliverable 7.

- **Omitted for lack of verified material:** hiring, coaching, performance management and career development in the Fortis case study (spec §5.1), and `content/leadership/leading-platform-delivery.md` entirely (spec §5.3 permits omitting it — the game incubator and IT-dependency material exists nowhere in this repository). Both need Lucas to supply facts.
- **Needs confirmation:** the 35% Prodigy cloud-cost reduction, which comes only from the spec and appears nowhere in the repository. Fallback if he cannot stand behind it: `38 accounts → 6`, which the AWS case study already supports.
- **Deliberate deviation:** the home-page headline is unchanged, for the reason in Task 4 Step 1.
- **Open question:** whether `.ca` or `.com` is canonical. Unresolvable from the repository; `hugo.toml` left as found.
- **Unchanged by design:** every technical case study body except the MCP-client wording, the architecture shortcodes and SVGs, the career timeline, and the Outside work section.
