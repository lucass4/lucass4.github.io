# lucassantanna.ca

Personal site. Hugo with a custom theme, deployed to GitHub Pages from `main` by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Running it

Requires Hugo 0.169 or later (extended not strictly needed — the stylesheet is plain
CSS — but the workflow installs extended and `brew install hugo` gives it to you).

```sh
hugo server          # http://localhost:1313, drafts hidden
hugo server -D       # include drafts
hugo --gc --minify   # production build into public/
```

There is no Node step and no npm install. The previous theme needed PostCSS; this one
does not.

## Layout

```
assets/css/main.css      design tokens and all component styles
assets/css/chroma.css    generated syntax highlighting, see below
assets/js/               theme toggle and copy-code, both progressive enhancement
content/_index.md        home page lede
content/about.md         about page, including the career timeline
content/work/            case studies
layouts/                 the theme
static/favicon.svg
tools/gen-chroma.py      regenerates assets/css/chroma.css
```

`layouts/` has no `themes/` directory and `hugo.toml` sets no `theme`, so the templates
in `layouts/` *are* the theme.

### Design tokens

Colour, type scale, spacing, radii and measure all live as CSS custom properties at the
top of `assets/css/main.css`. Light is the default; dark comes from
`prefers-color-scheme`, and `[data-theme]` on `<html>` overrides the system preference
when someone uses the toggle. With JavaScript disabled the toggle stays hidden and the
system preference still applies.

### Syntax highlighting

`assets/css/chroma.css` is generated. Do not edit it by hand:

```sh
python3 tools/gen-chroma.py > assets/css/chroma.css
```

It stitches `github` (light) and `github-dark` (dark) together and resets any token class
that the light style colours but the dark style omits. Without that reset, `github`'s
near-black punctuation colour applies on the dark surface and every colon in a YAML
block disappears.

## Adding content

A case study goes in `content/work/`. Front matter it understands:

| Key | Purpose |
|---|---|
| `problem` | One or two sentences, shown on the index and as the page standfirst |
| `role` | What you actually did |
| `scale` | Size or reach, when there is a verified figure |
| `outcome` | A sentence, shown in the factsheet on the case study page |
| `metric` | The headline figure, e.g. `2 days → 30 seconds`. Shown large in indexes |
| `metric_note` | Small print beside the figure |
| `stack` | List, rendered as a monospace run |
| `featured` | `true` puts it on the home page, highest three by `weight` |

Indexes show title, problem and `metric`. The prose `outcome`, plus `role`, `scale` and
`stack`, appear on the case study itself, in a block that is collapsed on mobile. A
sentence reads past in a list; a figure lands.

Case studies carry no `date`: they are ordered by `weight`, and a date would be published
as `article:published_time` as though it were a publication date. Articles in
`content/writing/` do have dates, and that is where the metadata comes from.

### Architecture diagrams

Two shortcodes, both rendering semantic HTML rather than an SVG or an image, so they
reflow at 390px, follow the theme tokens, stay selectable and searchable, and are read in
document order by a screen reader with no separate text alternative to maintain.

`stack` is a layer diagram: what each layer is responsible for and which component does
it. It states responsibilities, not topology.

```
{{< stack label="Platform layers" caption="Optional, markdown allowed." >}}
Layer name :: what it is responsible for :: component, component
Compute :: Managed Kubernetes :: EKS
{{< /stack >}}
```

`flow` is a sequence: how a request moves through a system and where it is stopped.

```
{{< flow label="One provisioning request" caption="Optional." >}}
Request :: Arrives in Slack as prose
gate: Human approval :: It proposes; a person approves
Service :: Baseline deployed on EKS
{{< /flow >}}
```

One row per line, fields separated by `::`. A row prefixed `gate:` renders as a boundary
instead of a numbered step, so the numbering counts work and not checkpoints, and the
place a request gets refused is the thing that stands out.

For both: only the lines you write become content. Add a diagram only when the underlying
details are verified, and say in the caption what the diagram deliberately leaves out.

Articles go in `content/writing/`. The section, its nav entry and the home page's Writing
block all appear only once at least one article is published. There is no flag to set:
the templates check whether the section has pages, which is what keeps an empty Writing
link out of the navigation today.

Anything with `draft: true` stays out of the production build.

**A draft still creates its section.** A single `draft: true` file in `content/writing/`
makes Hugo build an empty `/writing/` index and list it in the sitemap. Articles that are
not ready live in `drafts/` at the repo root, which Hugo never reads. See
[`drafts/README.md`](drafts/README.md).
