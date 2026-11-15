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

### Current production

The legacy static HTML website is live at [priyansh-15.github.io](https://priyansh-15.github.io/). The owner verified GitHub Pages settings on November 12, 2026: **Deploy from a branch**, branch **`master`**, directory **`/ (root)`**, with HTTPS enforced. `master` is also the repository's default branch.

`portfolio-v3` contains the new Astro source project, which is not yet deployed. [astro.config.mjs](astro.config.mjs) configures the same site origin and static output; the build produces deployable files in `dist/`. Merging Astro source into the current publishing branch would not automatically build it.

### Validation-only CI

[The CI workflow](.github/workflows/ci.yml) runs on pushes to `portfolio-v3` and pull requests targeting `portfolio-v3` or `master`. It installs locked dependencies, checks source formatting, runs Astro diagnostics and the build, and verifies the three generated pages and five legacy redirects. It does not deploy.

[CI run #1 (43187706140)](https://github.com/Priyansh-15/priyansh-15.github.io/actions/runs/43187706140) completed successfully for commit `9756e40`.

### Simple GitHub Pages deployment — prepared, not activated

[The manual deployment workflow](.github/workflows/deploy.yml) uses GitHub Actions to install the locked dependencies, validate and build the Astro site, verify the three pages and five legacy redirects, and upload/deploy the generated `dist/` artifact. It runs **only on manual dispatch from `master`**. Neither pull requests nor ordinary pushes deploy the site.

The legacy site is still served from the `master` repository root. This means a source-only merge **must not happen before the publishing cutover is coordinated**: an Astro source tree does not include a built `index.html` at the repository root.

After the publication checklist and any required employer disclosures are fully cleared:

1. Review the pull request, ensure CI passes, and record a recoverable copy of the existing legacy site.
2. Coordinate the cutover to GitHub Actions in **Settings → Pages → Build and deployment → Source**. This settings change must be performed by the repository owner; it is not accomplished by merging code.
3. Merge the approved `portfolio-v3` pull request into `master` and run **Actions → Deploy portfolio → Run workflow**, selecting `master`.
4. Verify the live homepage, both case studies, redirects, and HTTPS. Roll back to the saved approved legacy site if the cutover fails.

Until approval and the publishing-source migration, leave deployment untriggered and preserve the current live site. The earlier `master`-only `release-pages.yml` workflow is an inert draft, not part of this simplified deployment path, and can be removed separately.

## Publication review

See [REVIEW_BEFORE_PUBLISHING.md](REVIEW_BEFORE_PUBLISHING.md) for the publication checklist. Review case studies for factual accuracy, authorship, supporting evidence, and disclosure authorization.

Conceptual illustrations and hypothetical scenarios explain engineering reasoning; they are not evidence of production implementations or completed tests. Successful builds or tests do not establish clearance to publish professional information.
