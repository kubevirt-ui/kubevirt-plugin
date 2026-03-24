# /review -- Full Team Review Command

Run **all five review agents in parallel** on the current changes and present a unified summary.

Agent types, i18n compliance rules, code standards, and severity levels are defined in `.cursor/rules/team-review.mdc` (the single source of truth). This command file only covers scope detection, launch orchestration, output format, and post-review actions.

---

## 1. Scope Detection

Before launching agents, determine **what to review**:

1. **Staged changes** (`git diff --cached --name-only`) -- if files are staged, review those
2. **Unstaged changes** (`git diff --name-only`) -- if no staged files, review unstaged changes
3. **Current file** -- if no git changes, review the file open in the editor
4. **PR diff** -- if a PR URL is provided, fetch the diff and review it

Read all changed files so you can pass their content to the agents.

---

## 2. Agent Execution

Launch **all five agents in parallel** using the Task tool. Use the agent types from `team-review.mdc` Section 2 (Developer, UX, QE, Security, KubeVirt Expert).

Each agent receives:

- The **full content** of every changed file
- The **diff** showing what changed
- The agent's **specific focus areas** (from its rule file in `.cursor/rules/agents/`)
- Instruction to check **i18n compliance** and **code standards** per `team-review.mdc` Section 2

### Launch Pattern

```text
Use the Task tool five times in a single message:

Task 1: subagent_type="developer", prompt includes developer focus + i18n + code standards
Task 2: subagent_type="ux-reviewer", prompt includes UX focus
Task 3: subagent_type="qe-agent", prompt includes QE focus
Task 4: subagent_type="security-reviewer", prompt includes security focus
Task 5: subagent_type="kubevirt-expert", prompt includes KubeVirt focus
```

---

## 3. Output Format

After all agents complete, present a unified summary:

```markdown
## Team Review Summary

**Scope**: [files reviewed]
**Blockers**: X | **Suggestions**: Y | **Nitpicks**: Z

---

### Developer

[findings with severity icons]

### UX

[findings with severity icons]

### QE

[findings with severity icons]

### Security

[findings with severity icons]

### KubeVirt Expert

[findings with severity icons]

### i18n Compliance

[translation issues found across all agents]

### Code Standards

[file structure and naming issues]

---

Implement recommendations?

1. Yes, implement all
2. Choose which to implement
3. Skip
```

---

## 4. Post-Review Actions

Based on user choice:

- **Implement all**: Apply fixes for all blockers and suggestions, then re-run a quick check
- **Choose**: Present numbered list of findings, let user select which to implement
- **Skip**: End the review

After implementing fixes:

- Run `npm run i18n` if any strings were added or changed
- Run `npm run check-types` to verify no type errors
- Run `npm run lint` to verify linting passes
