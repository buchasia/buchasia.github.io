# Development Guide

## Local setup

Install dependencies and start the Astro development server:

```sh
npm install
npm run dev
```

The local site is available at `http://localhost:4321`.

After changing the Astro configuration or Markdown pipeline, restart the
development server:

```sh
npx astro dev stop
npm run dev -- --host localhost
```

Run the production validation before publishing:

```sh
npm run build
```

## Writing posts

Add posts under `content/blog`. Each post uses an `index.md` file with this
frontmatter:

```md
---
title: Your post title
date: "2026-09-12"
description: A short summary for archive pages and search.
tags: [fabric, data]
draft: true
---
```

### Draft posts

Set `draft: true` in the frontmatter while working on a post. Draft posts:
- Are visible during local development (`npm run dev`) so you can preview your changes.
- Are excluded automatically from production builds (`npm run build`), including post pages, archives, tags, and search.

When you are ready to publish, set `draft: false` (or remove the `draft` property).

Use stable, lowercase kebab-case folder names. For example:

```text
content/blog/amicable-pairs/index.md
```

becomes:

```text
/posts/amicable-pairs/
```

Avoid dates in URLs so titles and publication dates can change without
breaking existing links.

## Mathematics

Inline mathematics uses single dollar signs:

```md
The area is $A = \pi r^2$.
```

Display mathematics uses double dollar signs:

```md
$$
\sigma(n) = \sum_{d \mid n} d
$$
```

Math is rendered with `remark-math` and `rehype-katex`.

## Archive pagination

The post archive is generated automatically with six posts per page:

- `/posts/`
- `/posts/2/`
- `/posts/3/`

New posts appear on the first page, while older posts move to later pages.

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and
deploys the site to GitHub Pages whenever changes are pushed to `main`.

The repository is [buchasia/buchasia.github.io](https://github.com/buchasia/buchasia.github.io).
The custom domain is configured through `public/CNAME`.