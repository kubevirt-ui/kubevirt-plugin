---
name: create-std-doc
description: >-
  Create or update the route-level Software Test Description markdown for a
  Playwright E2E spec, following playwright/docs/STD-TEMPLATE.md.
disable-model-invocation: true
---

# Create STD Doc

Generate or update the **route-level** STD markdown for a Playwright spec. Each folder under `playwright/tests/<route>/` has one file named from the route path (path segments joined with `-`), e.g. `virtual-machines-list.md` in `tests/virtual-machines/list/`. Each `*.spec.ts` in that folder is a **module** under `## 4. Test Case Definitions`.

## 1. Execution Workflow

1. **Resolve spec:** Identify the target `*.spec.ts` and its route folder (`dirname(spec)`).
2. **Analyze:** Read the spec, `playwright/docs/STD-TEMPLATE.md`, and the route STD file (create from template if missing).
3. **Sanitize:** Redact credentials, tokens, and unnecessary PII from the spec.
4. **Plan:** Summarize test cases and which module section to add or preserve.
5. **Generate:** Update **only** the `### Module: \`<name>.spec.ts\``section (and shared sections 1–3 when route-wide context changes). Do **not** create`\*.spec.md` beside specs. Do **not** add an Approvals section or Requirements Traceability Matrix.
6. **Validate:** Print the checklist below.

## 2. Extraction & Mapping Rules

Follow `STD-TEMPLATE.md` for structure.

| Spec Source                    | STD Field / Action                                             |
| ------------------------------ | -------------------------------------------------------------- |
| `test.describe(...)`           | Module header Describe / Tags line                             |
| `utils.withAllure(...)`        | Allure line (Suite & Feature). Fallback to describe tags.      |
| `test(...)`                    | Numbered test case. **Preserve existing IDs; never renumber.** |
| `test.step(...)`               | Step / Expected Result table rows.                             |
| Setup helpers / hooks          | Section 3 (route or per-module subsection).                    |
| `test.skip()` / `test.fixme()` | **Pending** cases (include reason).                            |

- **Objectives:** From assertions, not title strings alone.
- **Skipped tests:** Document; mark `Pending` when skip is unconditional.

## 3. Conventions

- **Versioning:** `CNV <major>.<minor>.<patch>` (e.g. `CNV 5.0.0`). Default `Document Status` to `Draft`.
- **Jira:** Use per-test-case `Jira References` — not scenario titles.
- **Preservation:** Keep existing test case IDs when updating a module; never renumber.

## 4. Validation Checklist

- [ ] Updated the route-named STD file in the route folder (not a per-spec `.spec.md`).
- [ ] Module section matches `### Module: \`<file>.spec.ts\``.
- [ ] Section headers match `playwright/docs/STD-TEMPLATE.md` (sections 1–4 only).
- [ ] Every test case documented (including `.skip` / `.fixme`).
- [ ] Preserved test case IDs where applicable.
- [ ] Redacted secrets and cluster-specific credentials.
