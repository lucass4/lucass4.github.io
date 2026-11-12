#!/usr/bin/env python3
"""Build a two-theme Chroma stylesheet from `hugo gen chromastyles` output.

Light rules stay at the top level. Dark rules are emitted twice, once behind
prefers-color-scheme for visitors who never touch the toggle, and once behind
[data-theme="dark"] for visitors who did. Selectors are rewritten rather than
nested so the file needs no CSS-nesting support.

The important part: a Chroma style only emits the token classes it actually
colours. github-dark has no Punctuation rule, so without an explicit reset the
dark scopes inherit github's near-black `.p` and every colon in a YAML block
disappears against the dark surface. Any class present in light but missing
from dark is therefore reset to `color: inherit` inside the dark scopes.
"""
import os
import re
import subprocess
import sys

HUGO = os.environ.get("HUGO", "hugo")
RULE = re.compile(r"^(?P<lead>\s*(?:/\*(?P<name>.*?)\*/\s*)?)(?P<sels>[^{]+)\{(?P<body>[^}]*)\}\s*$")


def gen(style):
    out = subprocess.run(
        [HUGO, "gen", "chromastyles", "--style", style],
        capture_output=True, text=True, check=True,
    ).stdout
    # main.css owns the code block surface, so drop Chroma's own background.
    out = re.sub(r"/\* Background \*/ \.bg \{[^}]*\}\n?", "", out)
    out = re.sub(r"/\* PreWrapper \*/ \.chroma \{[^}]*\}\n?", "", out)
    return out.strip()


def parse(css):
    """Map each selector to (comment, declarations), preserving order."""
    rules = {}
    for line in css.splitlines():
        m = RULE.match(line)
        if not m:
            continue
        for sel in m.group("sels").split(","):
            sel = sel.strip()
            if sel:
                rules[sel] = (m.group("name") or "", m.group("body").strip())
    return rules


def emit(rules, prefix, extra_inherit):
    lines = []
    for sel, (name, body) in rules.items():
        comment = f"/* {name.strip()} */ " if name.strip() else ""
        lines.append(f"{comment}{prefix} {sel} {{ {body} }}")
    if extra_inherit:
        lines.append("")
        lines.append("/* Not coloured by the dark style; reset so these do not")
        lines.append("   inherit the light style's colours on a dark surface. */")
        joined = ",\n".join(f"{prefix} {s}" for s in sorted(extra_inherit))
        lines.append(f"{joined} {{ color: inherit }}")
    return "\n".join(lines)


light_css, dark_css = gen("github"), gen("github-dark")
light, dark = parse(light_css), parse(dark_css)
missing = [s for s in light if s not in dark]

header = f"""/* Syntax highlighting. Generated, do not edit by hand.
 *
 *   hugo gen chromastyles --style github       (light, the base)
 *   hugo gen chromastyles --style github-dark  (dark, scoped)
 *
 * {len(missing)} class(es) that github colours are absent from github-dark and
 * are reset to inherit inside the dark scopes: {", ".join(sorted(missing))}.
 * Without that, github's near-black Punctuation colour applies on the dark
 * surface and punctuation becomes invisible.
 */
"""

sys.stdout.write(
    "\n".join([
        header,
        emit(light, "", []),
        "",
        "@media (prefers-color-scheme: dark) {",
        emit(dark, ':root:not([data-theme="light"])', missing),
        "}",
        "",
        emit(dark, ':root[data-theme="dark"]', missing),
        "",
    ])
)
