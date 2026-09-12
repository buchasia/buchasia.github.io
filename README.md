# Cogito Ergo Sum

Personal blog of Dr. Chhitiz Buchasia, built with Astro and deployed to GitHub Pages.

## Local development

```sh
npm install
npm run dev
```

Add Markdown posts under `content/blog`. The GitHub Pages workflow deploys the site from `main`.

## Writing mathematics

Use standard KaTeX-compatible Markdown notation for mathematics. Wrap inline
expressions in single dollar signs:

```md
The area is $A = \pi r^2$.
```

Use double dollar signs for a centered display equation:

```md
$$
\sigma(n) = \sum_{d \mid n} d
$$
```

The site processes these expressions with `remark-math` and `rehype-katex`.
After changing the Astro configuration or Markdown pipeline, restart the local
development server so it loads the updated processor:

```sh
npx astro dev stop
npm run dev -- --host localhost
```
