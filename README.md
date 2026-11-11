# Priyansh Sharma — Engineering Portfolio

My personal portfolio presents software engineering work, architecture-oriented case studies, and engineering thinking, with a focus on backend and distributed systems.

## Technology

The site uses Astro, TypeScript, and custom CSS to generate static HTML. Native browser capabilities support features such as expandable article contents and failure scenarios; client-side scripts handle theme switching and mobile navigation.

[package.json](package.json) defines dependencies and scripts; [package-lock.json](package-lock.json) records the resolved dependency versions.

## Local development

The locked Astro package declares these requirements:

- Node.js `>=22.23.4`
- npm `>=9.6.5`

These are package-declared requirements, not a claim that the project has been tested on every permitted version.

Install the committed dependency tree and start the development server:

```bash
npm ci
npm run dev
```

The development server normally serves the site at `http://localhost:4321`, subject to local configuration and port availability.

## Validation and production build

| Command | Purpose |
| --- | --- |
| `npm run format:check` | Check Astro, TypeScript, and CSS formatting under `src/` without rewriting files. |
| `npm run check` | Run Astro diagnostics. |
| `npm run build` | Run Astro diagnostics, then generate static output in `dist/`. |
| `npm run preview` | Serve the built site locally for inspection. This does not deploy it. |

`npm run format` writes formatting changes to `src/**/*.{astro,ts,css}`. Use `npm run format:check` when only checking formatting.

## Routes and source ownership

| Route | Content |
| --- | --- |
| `/` | Portfolio homepage, selected work, and engineering thinking. |
| `/work/distributed-billing/` | Distributed billing case study. |
| `/work/order-scheduler/` | Order scheduler case study. |

Both case studies are linked from the homepage.

| Path | Responsibility |
| --- | --- |
| [src/pages/](src/pages/) | Pages and case-study content. |
| [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) | Document structure, metadata, and shared theme and navigation behavior. |
| [src/components/Header.astro](src/components/Header.astro) | Shared header and typed navigation links. |
| [src/components/Footer.astro](src/components/Footer.astro) | Shared footer. |
| [src/components/ArticleNavigation.astro](src/components/ArticleNavigation.astro) | Desktop and mobile case-study contents navigation. |
| [src/data/site.ts](src/data/site.ts) | Shared metadata defaults and profile URLs. |
| [src/styles/global.css](src/styles/global.css) | Custom design system and responsive styles. |
| [public/](public/) | Public static assets. |

The homepage uses the layout's default title and description. Each case study supplies its own page metadata.

## Development and publication status

`portfolio-v3` is the current development branch for the rebuild. `master` is the GitHub repository's default branch; that does not establish the GitHub Pages publishing source.

[astro.config.mjs](astro.config.mjs) configures static output and the site origin `https://priyansh-15.github.io`. The actual GitHub Pages publishing source and deployment mechanism have not yet been independently verified. Production publication requires separate review and authorization.

## Publication review

See [REVIEW_BEFORE_PUBLISHING.md](REVIEW_BEFORE_PUBLISHING.md) for the publication checklist. Review case studies for factual accuracy, authorship, supporting evidence, and disclosure authorization.

Conceptual illustrations and hypothetical scenarios explain engineering reasoning; they are not evidence of production implementations or completed tests. Successful builds or tests do not establish clearance to publish professional information.
