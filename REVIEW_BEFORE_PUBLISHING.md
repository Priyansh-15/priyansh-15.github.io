# Publication Review Checklist

Apply this checklist to the homepage, both case studies, repository documentation, and public assets for the proposed release. Leave items unchecked until supported by review evidence; this document does not itself clear the portfolio for publication.

## Accuracy, ownership, and authorship

- [ ] Personally review first-person contributions, role descriptions, achievements, and claimed design or implementation ownership; correct any exaggerated responsibility or scope before publication.
- [ ] Verify technical explanations and architectural decisions, including homepage summaries, against what the author can accurately explain and substantiate.
- [ ] Review every paragraph for natural, specific writing in the author's own voice. Personal confirmation, independent evidence, and disclosure permission are separate requirements; accuracy alone does not grant permission.

## Distributed Billing case study

Limited status: the author has confirmed publication approval for specific billing measurements. This records that scoped confirmation, not independently established employer authorization or verification of the results. It does not cover other measurements, architecture, source code, or customer details.

- [ ] Review [Distributed Billing](src/pages/work/distributed-billing/index.astro) for accurate personal ownership, processing-stage descriptions, distributed coordination, concurrency, and failure recovery explanations.
- [ ] Confirm diagrams and timelines remain conceptual explanations, not production architecture documentation, incident reports, or claims that every mitigation was implemented.
- [ ] Verify laboratory and performance results against evidence: provenance, workload, environment, measurement scope, methodology, exclusions, and limitations. Do not present laboratory results as production outcomes.
- [ ] Confirm proposed measurements fall within the limited approval; obtain separate disclosure authorization for additional measurements or technical details. Resolve outstanding evidence and employer-disclosure requirements with the appropriate authorized reviewer before publication.

## Order Scheduler case study

- [ ] Review [Order Scheduler](src/pages/work/order-scheduler/index.astro) for accurate personal ownership, planning/execution boundaries, provider integrations, and business-rule explanations.
- [ ] Confirm workflow diagrams, planning contracts, matrix examples, and illustrative test cases remain clearly distinguished from internal implementations and executed tests.
- [ ] Keep failure scenarios and recovery behavior hypothetical unless evidence supports an actual incident or implemented behavior and its disclosure is authorized.
- [ ] Confirm the explanation exposes no employer-confidential implementation or provider-specific information; resolve disclosure questions before publication.

## Evidence classification

- [ ] Classify each substantive claim using the categories below. Categories can overlap; none automatically establishes another.

| Category | What it establishes |
| --- | --- |
| Personally confirmed experience | The author confirms their role and recollection; independent verification and disclosure permission remain separate. |
| Independently verified technical evidence | Evidence supports the stated result within its documented conditions and limitations. |
| Conceptual architectural explanation | An explanatory model, not documentation of production architecture. |
| Hypothetical scenario or proposed test | A design or verification exercise, not an observed incident or completed test. |
| Unverified or incomplete claim | Evidence or review is outstanding; do not present it as established fact. |
| Authorized public disclosure | Permission applies to specific material and scope; it does not establish technical correctness. |

- [ ] Do not use a passing website build as evidence for an engineering claim, or prior public appearance as proof of verification or permission.

## Confidentiality and disclosure

- [ ] Review source, documentation, metadata, and assets for confidential architecture, implementation, code, configuration, screenshots, customer information, identifiers, internal systems, URLs, issue references, repository links, proprietary integrations, and operational procedures.
- [ ] Check for private documents or assets accidentally included in public files. Git ignore rules and formatter exclusions do not make tracked information private.
- [ ] Review relevant public branches and previously tracked assets when assessing historical exposure. Historical résumé and legacy-asset review requirements remain unresolved here; do not infer that removal from the current tree resolves earlier publication.
- [ ] Keep restricted evidence and approval correspondence outside the public repository. Record only non-sensitive review status; prior approval of one claim does not authorize unrelated disclosure.
- [ ] Leave historical-publication concerns visible for authorized follow-up. This checklist authorizes neither Git-history rewriting nor publication changes.

## Independent public projects

- [ ] For AI Code Intelligence and any other current or future public project, describe its actual status. Require a runnable, inspectable implementation before claiming completion; do not present future ideas as delivered work.
- [ ] Add repository or demonstration links only when they exist and have been verified. Support claimed features, benchmarks, and test results with evidence and stated limitations.
- [ ] Attribute original implementation accurately and identify third-party contributions. Confirm no unauthorized reuse of employer-owned code, confidential designs, or private data, including in examples and test fixtures.

## Final publication checks

- [ ] Reconfirm accuracy, personal voice, evidence classification, and disclosure status for the exact proposed content; resolve unsupported claims and pending permissions before release.
- [ ] Verify internal links, fragment targets, external links, public assets, and page metadata, including titles, descriptions, canonical URLs, and Open Graph values.
- [ ] Review responsive layouts, diagram reflow, technical tables, contrast, and dark/light themes across relevant viewport sizes.
- [ ] Check keyboard navigation, semantic HTML, accessible names, visible focus and restoration, article disclosures, and no-JavaScript and initialization-failure navigation fallbacks.
- [ ] Check reduced-motion support and relevant browser behavior; report untested environments rather than assuming they pass.
- [ ] Run the applicable [README validation commands](README.md#validation-and-production-build) and record actual results. Technical validation and disclosure approval are separate publication gates.
- [ ] Obtain explicit authorization before merging or deploying public changes. Confirm the publishing source and deployment mechanism before release; do not infer them from the default branch.
