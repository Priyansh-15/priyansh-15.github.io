# Engineering Portfolio — v2

A ground-up Astro portfolio rebuild. This milestone implements the responsive homepage, shared design tokens, theme toggle, navigation and deployment configuration.

## Run locally

Requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Visit http://localhost:4321.

## Validate

```bash
npm run check
npm run build
npm run preview
```

## Integrating into the existing GitHub Pages repository

1. Clone `Priyansh-15/priyansh-15.github.io` and create a `portfolio-v2` branch.
2. Copy **the contents** of this folder into the cloned repository working tree. Remove the old site HTML/CSS/assets only on that new branch. Keep `.git` and any repository settings.
3. Run `npm install` to generate `package-lock.json`, and commit both the lockfile and source changes.
4. Test and review on the branch. **Do not merge to main** until the design, content, and deployment have been approved.
5. When ready to publish, configure GitHub Settings → Pages → Source: **GitHub Actions**. The supplied workflow deploys on pushes to `main`.

## Project notes

- No résumé PDF is linked yet because a verified up-to-date public file was not supplied in this milestone.
- Case studies are labeled **in preparation** and deliberately have no dead-end links.
- The architectural illustration is conceptual, not a depiction of proprietary systems.
- This milestone uses CSS design tokens directly rather than Tailwind to keep the dependency surface and initial client bundle small. Tailwind may be added if it brings a demonstrable benefit.
- Fonts load from Google Fonts; later we can self-host licensed font assets and evaluate privacy/performance tradeoffs.
- No analytics, tracking, or contact collection is included.
