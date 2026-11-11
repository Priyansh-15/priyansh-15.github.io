# Engineering guide

## Repository and ownership

This is Priyansh Sharma's personal software engineering portfolio, built with Astro, TypeScript, and custom CSS.
See [README.md](README.md) for setup, commands, routes, and verified development details.

- `src/pages/` owns pages and case-study content.
- `src/layouts/BaseLayout.astro` owns document structure, metadata defaults, and shared theme and navigation behavior.
- `src/components/Header.astro` owns header markup and the typed links shared by desktop and mobile navigation.
- `src/components/Footer.astro` owns shared footer markup; preserve intentional page-specific copy and accessible names.
- `src/components/ArticleNavigation.astro` owns desktop and mobile case-study contents navigation.
- `src/data/site.ts` owns shared metadata defaults and profile URLs.
- `src/styles/global.css` owns the design system and responsive styles.

## Scope and authorization

- Before editing, confirm the requested branch and any checkpoint supplied in the task. Inspect staged, unstaged, and untracked files.
- Stop and report unexpected changes. Preserve user work; do not overwrite or discard it to obtain a clean baseline.
- Modify only files explicitly authorized for the current task. Keep changes focused and independently reviewable.
- Local implementation does not authorize staging, commits, or publication.
- Do not stage, commit, push, merge, deploy, create/switch/delete branches, rewrite history, delete unrelated files, or modify remote resources without separate explicit authorization.
- Stop at the task's agreed review boundary; do not start the next milestone automatically.
- Keep checkpoint SHAs, temporary file scopes, and one-off test matrices in task prompts, not this guide.

## Code conventions

- Follow [.prettierrc.json](.prettierrc.json) and the strict TypeScript settings in [tsconfig.json](tsconfig.json).
- Keep Astro components small and understandable. Reuse established components where appropriate; avoid speculative abstractions or framework-like solutions.
- Do not add dependencies without authorization or broaden a task into unrelated refactoring or formatting.
- Treat Astro markup whitespace as potentially visible output, especially around inline elements, expressions, and preformatted examples.
- Preserve CSS cascade behavior, including selector specificity, source order, shorthand resets, and responsive conditions.

## Approved behavior to preserve

Unless the task explicitly authorizes a change, preserve:

- Existing routes, fragment destinations, links, accessible names, and semantic HTML.
- Desktop and mobile disclosure-navigation semantics, synchronized menu state, keyboard operation, visible focus, and Escape focus restoration.
- Native navigation, modified clicks, fragment scrolling, and focus handling across viewport changes.
- No-JavaScript and initialization-failure navigation fallbacks.
- Theme switching, persistence, and dark/light appearance.
- Article contents navigation and native disclosures.
- Technical table names, header semantics, focusability, and keyboard scrolling.
- Responsive layouts, diagram reflow, container queries, and reduced-motion support.
- Typography, CSS variables, spacing, and the established visual hierarchy.

Structural refactoring must not silently become a redesign. Keep editorial changes out of code-cleanup tasks unless authorized.

## Validation and reporting

- Use the [README command reference](README.md#validation-and-production-build); choose validation proportional to the change and within the task's authorization.
- For source changes, check formatting, Astro diagnostics, build output, and Git diff integrity as appropriate. Compilation alone does not establish rendering or behavior equivalence.
- For visual or behavioral changes, use browser and accessibility regression checks against the approved baseline, covering affected routes, themes, responsive states, and keyboard interactions.
- For documentation-only changes, verify facts, paths, Markdown links, and `git diff --check`. Inspect new untracked files directly because normal Git diffs omit them.
- Never claim a test passed unless it ran. Distinguish independently verified results, tool-reported results, and unverified areas or environmental limitations.
- Report changed files, significant decisions, validation results, remaining risks, and final working-tree and staging status.

## Authenticity and disclosure

- Use natural, specific writing that accurately reflects the owner's individual contributions and engineering perspective.
- Distinguish conceptual explanations and hypothetical scenarios from evidence of actual implementation. Do not imply production validation of illustrative examples.
- Never invent metrics, incidents, customer outcomes, or test results.
- Do not publish employer-confidential source code, architecture, configuration, customer information, internal URLs, or identifiers.
- Use [REVIEW_BEFORE_PUBLISHING.md](REVIEW_BEFORE_PUBLISHING.md) as the publication-review authority. Professional material requires explicit review before publication; successful technical checks do not establish disclosure clearance.
- Prior publication or approval of one measurement does not authorize unrelated disclosures. Treat factual accuracy, supporting evidence, and disclosure permission as separate requirements.
- Keep private approval correspondence and confidential evidence out of this guide and the public repository.
