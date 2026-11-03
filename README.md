# Priyansh Sharma — Portfolio V2.1

A personal engineering portfolio built with Astro, TypeScript, and a small custom CSS design system.

## Run locally

Requires a Node.js version compatible with Astro 5.

```bash
npm install
npm run dev
```

Visit http://localhost:4321

## Validate

```bash
npm run check
npm run build
npm run preview
```

## Deploy

Designed for the username-based GitHub Pages repository `Priyansh-15/priyansh-15.github.io`. The existing `.github/workflows/deploy.yml` deploys the static site from `dist/`. Do not deploy the development branch until content and QA are approved.

## Content review before publishing

- Review every sentence for accuracy and personal voice.
- Have your employer approve any project details that might reveal proprietary information.
- Case-study pages are deliberately not linked yet; no dead links or unpublished evidence are presented as complete.
- Replace the conceptual diagrams with reviewed engineering illustrations as detailed case studies are written.
- Review responsive layouts, keyboard navigation, dark/light modes, typography and real-device performance.

The source code is not a replacement for personal review; the portfolio should accurately reflect Priyansh's own work and viewpoint.


## V2.2 — Engineering case study

- New route: `/work/distributed-billing/`
- Homepage billing entry links to the new case study.
- Architecture is conceptual and deliberately excludes internal implementation details.
- **Review before publishing:** confirm every first-person claim is accurate, disclose only company-approved details, and confirm the public copy reflects your own wording.
- Test with `npm install`, `npm run build`, and `npm run dev`. Do not deploy to the default branch until reviewed.


## V2.3 — Billing case study

The `/work/distributed-billing/` article now includes a conceptual data/control plane visualization, lease-race timeline, expandable failure scenarios, decision tradeoffs and a validation framework. These are **explanatory models**, not employer documentation or proof of production tests. Read `REVIEW_BEFORE_PUBLISHING.md` before deploying.
