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
| `outcome` | Only when it is verified |
| `stack` | List, rendered as a monospace run |
| `featured` | `true` puts it on the home page, highest three by `weight` |

Indexes show title, problem and outcome only. `role`, `scale` and `stack` appear on the
case study itself, in a block that is collapsed on mobile.

Case studies carry no `date`: they are ordered by `weight`, and a date would be published
as `article:published_time` as though it were a publication date. Articles in
`content/writing/` do have dates, and that is where the metadata comes from.

### Architecture diagrams

The `stack` shortcode renders a layer diagram as semantic HTML, so it reflows at 390px,
follows the theme tokens, stays selectable, and is read in order by a screen reader with
no separate text alternative to maintain.

```
{{< stack label="Platform layers" caption="Optional, markdown allowed." >}}
Layer name :: what it is responsible for :: component, component
Compute :: Managed Kubernetes :: EKS
{{< /stack >}}
```

One layer per line, fields separated by `::`. Only the lines you write become content, so
a diagram can state responsibilities without implying a topology. Add one only when the
underlying details are verified.

Articles go in `content/writing/`. The section, its nav entry and the home page's Writing
block all appear only once at least one article is published. There is no flag to set:
the templates check whether the section has pages, which is what keeps an empty Writing
link out of the navigation today.

Anything with `draft: true` stays out of the production build.
