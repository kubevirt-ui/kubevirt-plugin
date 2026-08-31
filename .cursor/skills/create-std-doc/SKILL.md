---
name: create-std-doc
description: >-
  Create or update a Software Test Description (STD) markdown file for a
  KubeVirt Playwright E2E spec, colocated next to the .spec.ts file and
  following playwright/docs/STD-TEMPLATE.md.
disable-model-invocation: true
---

# Create STD Doc

You are an expert QA Automation Engineer. Your task is to generate or update a colocated Software Test Description (STD) markdown file (`.spec.md`) for a Playwright E2E spec (`.spec.ts`).

## 1. Execution Workflow

1. **Analyze Files:** Read the target `.spec.ts` file, the official template (`playwright/docs/STD-TEMPLATE.md`), and the existing `.spec.md` (if it exists).
2. **Sanitize:** Redact any credentials, tokens, cookies, or unnecessary PII found in the spec file.
3. **Plan:** Output a brief, 2-3 sentence summary of the test cases identified and what existing data (Approvals, IDs, Matrix rows) will be preserved.
4. **Generate:** Write the `.spec.md` file to the exact same directory as the `.spec.ts` file, replacing the `.ts` extension with `.md`.
5. **Validate:** Output the Validation Checklist at the end.

## 2. Extraction & Mapping Rules

Strictly follow `STD-TEMPLATE.md` for structure and section names.

| Spec Source                    | STD Field / Action                                             |
| ------------------------------ | -------------------------------------------------------------- |
| `test.describe(...)`           | Describe / Tags line                                           |
| `utils.withAllure(...)`        | Allure line (Suite & Feature). Fallback to describe tags.      |
| `test(...)`                    | Numbered test case. **Preserve existing IDs; never renumber.** |
| `test.step(...)`               | Step / Expected Result table rows.                             |
| Setup helpers / hooks          | Test Environment & Prerequisites.                              |
| `test.skip()` / `test.fixme()` | Document as **Pending** cases (include the block reason).      |

- **Objectives:** Derive the test case `Objective` from what the test _actually asserts_, not just the title string.
- **Skipped/Deferred Tests:** Do not omit them. If a skip is conditional and evaluates to false, mark it as `Automated`. If unconditional or true, mark it `Pending`.

## 3. Design Conventions & Traceability

- **Versioning:** Use `Latest version` and `Target version` formatted as three-part `CNV <major>.<minor>.<patch>` (e.g. `CNV 5.0.0`). Never `CNV 5.0` or `CNV 5.00`. Derive from PR base branch or Jira `fixVersions`. Ensure they match. Default `Document Status` to `Draft`.
- **Titles & Jira IDs:** Write precise scenario titles. **Do not put Jira IDs in scenario titles.** Place `CNV-[0-9]+` keys in the per-scenario `Jira References` field and the Traceability Matrix.
- **Scope Definition:**
  - _In-Scope:_ Derived directly from the file's assertions.
  - _Out-of-Scope:_ Only note adjacent, untested variants of the _same_ feature/modal covered in this file. (Do not list unrelated features).
- **Preservation Rule:** If updating an existing `.spec.md`, you **must preserve** manually maintained Approvals, Traceability Matrix rows, and existing Test Case IDs unless explicitly told otherwise.

## 4. Validation Checklist

Print and check off these items at the end of your response:

- [ ] Placed the generated `.spec.md` in the exact same directory as the `.spec.ts` file.
- [ ] Used exact section headers from `playwright/docs/STD-TEMPLATE.md`.
- [ ] Documented every test case (including `.skip` and `.fixme`).
- [ ] Preserved existing Test Case IDs, Approvals, and historical Traceability Matrix rows.
- [ ] Placed Jira IDs in `Jira References` and the Matrix, NOT in scenario titles.
- [ ] Redacted all credentials, secrets, and cluster IDs.
- [ ] Formatted `Latest version` and `Target version` as `CNV <major>.<minor>.<patch>` (e.g. `CNV 5.0.0`), not `5.0` or `5.00
  > > > > > > > c8ff20e69 (NV-76355: Add relevant tests)
