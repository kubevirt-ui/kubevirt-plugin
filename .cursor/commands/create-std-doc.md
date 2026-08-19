# /create-std-doc -- Create STD Doc Command

Read `.cursor/skills/create-std-doc/SKILL.md` — it is the single source of truth for what this command does and how.

## Input

```text
/create-std-doc <spec-file-path-or-feature-name>
```

- **Spec file path**: `/create-std-doc playwright/tests/<tier>/<feature>/<name>.spec.ts`
- **Feature name**: `/create-std-doc <feature description>`

If no path or feature name is given, ask the user which spec to document.

### Feature-name resolution

STD docs are written only for Playwright `.spec.ts` files (as a colocated
`.spec.md`). Feature-name search must return only `*.spec.ts` candidates —
never `.spec.md`, helpers, fixtures, or other TypeScript files.

When the input is not a `.spec.ts` path, map the description to `.spec.ts`
files **before** generating an STD:

1. List files with `rg --files playwright/tests -g '*.spec.ts'` (search only that tree).
2. Normalize the description to lowercase tokens (split on whitespace and punctuation; drop empty tokens).
3. A `.spec.ts` file is a candidate when its repo-relative path contains **every** token as a case-insensitive substring, or when its basename without `.spec.ts` equals the full description (case-insensitive).
4. Print the full list of matching `.spec.ts` repo-relative paths.

Then:

- **Zero matches:** stop and ask the user for a single relative `playwright/tests/...spec.ts` path.
- **Multiple matches:** stop, list the candidates, and wait for the user to select exactly one.
- **Exactly one match:** use that path.

Do not generate an STD until exactly one spec is identified. Path validation, reading, and writing then follow the skill.

## Execution

Follow `.cursor/skills/create-std-doc/SKILL.md` end-to-end.
