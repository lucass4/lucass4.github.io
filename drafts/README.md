# Drafts

Articles that are not ready to be content yet.

Hugo never sees this directory, which matters: a file in `content/writing/` creates the
`writing` section even when the only file in it is a draft, and the production build then
emits an empty `/writing/` index page and lists it in the sitemap. `draft: true` keeps the
article unpublished but does not stop the section from existing.

To publish one:

```sh
mkdir -p content/writing
git mv drafts/<name>.md content/writing/
# then remove `draft: true` from the front matter
```

The Writing nav entry, the home page's Writing block and `/writing/` all appear together
at that point, because the templates key off whether the section has published pages.
