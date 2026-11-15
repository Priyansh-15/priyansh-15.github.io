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

### Publishing setup

GitHub Pages was verified by the owner on November 12, 2026 as **Deploy from a branch**, branch **`master`**, folder **`/ (root)`**, HTTPS enforced. The repository keeps `.nojekyll` so its Astro source files are not interpreted as Jekyll front matter.

The source of truth for the new portfolio is `src/`, `public/`, and [astro.config.mjs](astro.config.mjs). The [publishing workflow](.github/workflows/deploy.yml) builds this source into `dist/`, verifies the three pages and five redirect outputs, then copies the generated files to the already-configured `master` root and requests a GitHub Pages rebuild. GitHub Actions uses a short-lived repository-scoped token for the output commit; no personal access token is required.

- On relevant source changes to `master`, GitHub Actions runs the locked dependency install, formatting check and Astro build, then commits generated static files to the existing Pages root.
- The workflow is also manually dispatchable from `master`.
- Changes to the generated root `index.html`, root `work/`, or root `_astro/` are build outputs and may be overwritten. Edit the Astro sources instead.
- The legacy source before the migration is preserved at [backup/legacy-site-2026-11-15](https://github.com/Priyansh-15/priyansh-15.github.io/tree/backup/legacy-site-2026-11-15).
- The previous `.github/workflows/release-pages.yml` is an inert draft and is not used by this branch-root publishing process.

### Source validation

[CI](.github/workflows/ci.yml) checks the feature branch and pull requests, including all three generated pages and five legacy redirects. Production publishing applies equivalent checks before copying generated output.

To check a deployment, inspect the latest successful `Publish Astro portfolio` and GitHub-managed `pages build and deployment` runs. A workflow that only commits generated files is insufficient to trigger branch-based Pages builds: the publishing workflow explicitly requests a Pages rebuild afterward.

## Publication review

See [REVIEW_BEFORE_PUBLISHING.md](REVIEW_BEFORE_PUBLISHING.md) for the publication checklist. Review case studies for factual accuracy, authorship, supporting evidence, and disclosure authorization.

Conceptual illustrations and hypothetical scenarios explain engineering reasoning; they are not evidence of production implementations or completed tests. Successful builds or tests do not establish clearance to publish professional information.
