# AI Assistant Configuration

This project includes Cursor AI rules that provide consistent coding assistance across the team. When you open this project in Cursor, these rules are automatically loaded.

> **New to the project?** See [GETTING_STARTED_AI.md](./GETTING_STARTED_AI.md) for a comprehensive guide.

---

## Quick Start

1. Open the project in Cursor
2. Start coding - the AI already knows your project's standards
3. Try these commands:
   - _"Show my Jira tickets"_ → See your assigned work
   - _"Start working on CNV-12345"_ → Fetch ticket and begin
   - _"Review this code"_ → Get multi-perspective feedback
   - _"Test this in the browser"_ → Interactive testing

---

## What's Included

### Core Rules (Always Active)

| Rule               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `project-context`  | KubeVirt architecture, key concepts, project structure |
| `coding-standards` | Code style, TypeScript patterns, React conventions     |
| `team-review`      | Multi-perspective agent (Developer, UX, QE, Security)  |

### File-Specific Rules (Activate When Relevant Files Open)

| Rule               | Triggers On               | Description                          |
| ------------------ | ------------------------- | ------------------------------------ |
| `react-components` | `*.tsx`                   | Component patterns, PatternFly usage |
| `typescript`       | `*.ts`                    | Type safety, KubeVirt API types      |
| `testing`          | `*.test.ts`, `cypress/**` | Jest & Cypress patterns              |
| `styles`           | `*.scss`                  | BEM, PatternFly variables            |
| `i18n`             | `locales/**`              | Translation patterns                 |

### Agent Personas (Deep-Dive Reviews)

| Agent               | Invoke With            | Focus                                   |
| ------------------- | ---------------------- | --------------------------------------- |
| `developer`         | _"as developer"_       | Code quality, architecture, performance |
| `ux-reviewer`       | _"as ux"_              | Accessibility, UX patterns, PatternFly  |
| `qe-agent`          | _"as qe"_              | Testing, edge cases, race conditions    |
| `security-reviewer` | _"as security"_        | Vulnerabilities, XSS, auth              |
| `kubevirt-expert`   | _"as kubevirt expert"_ | K8s/VM domain knowledge                 |

### Workflows

| Workflow              | Invoke With                     | Purpose                                  |
| --------------------- | ------------------------------- | ---------------------------------------- |
| `common-commands`     | _"how do I build"_              | Build, test, lint, deploy commands       |
| `new-component`       | _"create component"_            | Component creation with proper structure |
| `pr-preparation`      | _"prepare PR"_                  | Pre-PR checklist and description         |
| `debugging`           | _"help debug"_                  | Systematic debugging approach            |
| `jira-workflow`       | _"my tickets"_, _"search jira"_ | Jira search, update, comment             |
| `ticket-workflow`     | _"CNV-XXX"_, Jira URL           | Full agent tracking for ticket work      |
| `playwright-testing`  | _"test in browser"_             | Interactive UI testing                   |
| `feature-development` | _"full workflow"_               | End-to-end: Jira → Code → PR             |

---

## MCP Integrations

### Jira

```
"Show my assigned tickets"
"Start working on CNV-12345"
"Add comment to CNV-12345"
"Move CNV-12345 to Code Review"
```

### Playwright (Browser Testing)

```
"Navigate to the VM list page"
"Click the Create button"
"Take a screenshot"
"Test the form validation"
```

---

## Quick Reference

### Common Commands

| Want To...       | Say...                        |
| ---------------- | ----------------------------- |
| Get my tickets   | _"Show my assigned tickets"_  |
| Start a task     | _"Start working on CNV-XXXX"_ |
| Create component | _"Create a component for X"_  |
| Add tests        | _"Add tests for this"_        |
| Review code      | _"Review my changes"_         |
| Deep review      | _"As [role], review this"_    |
| Prepare PR       | _"Prepare this for PR"_       |
| Debug issue      | _"Help me debug this"_        |
| Test in browser  | _"Test this page"_            |

### Agent Quick Reference

| Say                    | You Get                             |
| ---------------------- | ----------------------------------- |
| _"as developer"_       | Code quality, architecture analysis |
| _"as ux"_              | Accessibility, UX review            |
| _"as qe"_              | Edge cases, test coverage analysis  |
| _"as security"_        | Security vulnerability check        |
| _"as kubevirt expert"_ | K8s/VM domain expertise             |

### NPM Commands

```bash
npm run dev              # Start dev server
npm run start-console    # Start console container
npm run check-types      # TypeScript check
npm run lint             # Lint check
npm run lint:fix         # Auto-fix lint issues
npm test                 # Run unit tests
npm run i18n             # Update translations
```

---

## Team Review Agent

The AI automatically reviews code from multiple perspectives:

| Perspective      | Focus Areas                                           |
| ---------------- | ----------------------------------------------------- |
| 🧑‍💻 **Developer** | Correctness, patterns, performance, error handling    |
| 🎨 **UX**        | Accessibility, loading/error/empty states, PatternFly |
| 🧪 **QE**        | Edge cases, test coverage, race conditions            |
| 🔒 **Security**  | Input validation, XSS, secrets, auth                  |

**Feedback Categories:**

- 🔴 **Blocker** - Must fix before merge
- 🟡 **Suggestion** - Should consider
- 🟢 **Nitpick** - Optional improvement

---

## Personal Customization

Create personal rules that aren't shared with the team:

1. Create: `.cursor/rules/personal-<name>.mdc`
2. It's automatically gitignored
3. Add your preferences

Example `.cursor/rules/personal-shortcuts.mdc`:

```markdown
---
description: My personal shortcuts
alwaysApply: true
---

When I say "qc", run: npm run check-types && npm run lint && npm test
When I say "fmt", run: npm run lint:fix
```

---

## Complete Rules Reference

All rule files are in `.cursor/rules/`. Click to view each one.

### Core Rules (Always Active)

| Rule             | File                                                       | Description                                   |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Project Context  | [project-context.mdc](.cursor/rules/project-context.mdc)   | Architecture, key concepts, project structure |
| Coding Standards | [coding-standards.mdc](.cursor/rules/coding-standards.mdc) | TypeScript, React, SCSS conventions           |
| Team Review      | [team-review.mdc](.cursor/rules/team-review.mdc)           | Multi-perspective code review agent           |

### File-Specific Rules

| Rule                 | File                                                       | Activates On              |
| -------------------- | ---------------------------------------------------------- | ------------------------- |
| React Components     | [react-components.mdc](.cursor/rules/react-components.mdc) | `*.tsx` files             |
| TypeScript           | [typescript.mdc](.cursor/rules/typescript.mdc)             | `*.ts` files              |
| Testing              | [testing.mdc](.cursor/rules/testing.mdc)                   | `*.test.ts`, `cypress/**` |
| Styles               | [styles.mdc](.cursor/rules/styles.mdc)                     | `*.scss` files            |
| Internationalization | [i18n.mdc](.cursor/rules/i18n.mdc)                         | `locales/**` files        |

### Agent Personas

| Agent             | File                                                                       | Expertise                                  |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| Developer         | [agents/developer.mdc](.cursor/rules/agents/developer.mdc)                 | Code quality, architecture, performance    |
| UX Reviewer       | [agents/ux-reviewer.mdc](.cursor/rules/agents/ux-reviewer.mdc)             | Accessibility, UX patterns, PatternFly     |
| QE Agent          | [agents/qe-agent.mdc](.cursor/rules/agents/qe-agent.mdc)                   | Edge cases, test coverage, race conditions |
| Security Reviewer | [agents/security-reviewer.mdc](.cursor/rules/agents/security-reviewer.mdc) | Vulnerabilities, XSS, auth, secrets        |
| KubeVirt Expert   | [agents/kubevirt-expert.mdc](.cursor/rules/agents/kubevirt-expert.mdc)     | K8s patterns, VM lifecycle, APIs           |

### Workflows

| Workflow            | File                                                                                 | Purpose                      |
| ------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| Common Commands     | [common-commands.mdc](.cursor/rules/common-commands.mdc)                             | Build, test, lint, deploy    |
| New Component       | [workflows/new-component.mdc](.cursor/rules/workflows/new-component.mdc)             | Creating React components    |
| PR Preparation      | [workflows/pr-preparation.mdc](.cursor/rules/workflows/pr-preparation.mdc)           | Pre-merge checklist          |
| Debugging           | [workflows/debugging.mdc](.cursor/rules/workflows/debugging.mdc)                     | Systematic troubleshooting   |
| Jira Workflow       | [workflows/jira-workflow.mdc](.cursor/rules/workflows/jira-workflow.mdc)             | Jira search, update, comment |
| Ticket Workflow     | [workflows/ticket-workflow.mdc](.cursor/rules/workflows/ticket-workflow.mdc)         | Agent tracking for tickets   |
| Playwright Testing  | [workflows/playwright-testing.mdc](.cursor/rules/workflows/playwright-testing.mdc)   | Interactive UI testing       |
| Feature Development | [workflows/feature-development.mdc](.cursor/rules/workflows/feature-development.mdc) | End-to-end development       |

### File Structure

```
.cursor/rules/
├── project-context.mdc          # Always active
├── coding-standards.mdc         # Always active
├── common-commands.mdc          # On-demand
├── team-review.mdc              # Always active
├── agents/
│   ├── developer.mdc
│   ├── ux-reviewer.mdc
│   ├── qe-agent.mdc
│   ├── security-reviewer.mdc
│   └── kubevirt-expert.mdc
└── workflows/
    ├── new-component.mdc
    ├── pr-preparation.mdc
    ├── debugging.mdc
    ├── jira-workflow.mdc
    ├── ticket-workflow.mdc
    ├── playwright-testing.mdc
    └── feature-development.mdc
```

---

## Contributing to Rules

1. Edit files in `.cursor/rules/`
2. Keep rules focused and organized
3. Include examples where helpful
4. Test that they work as expected
5. Submit a PR with your changes

---

## Troubleshooting

### Rules not loading?

- Ensure you're using Cursor (not VS Code)
- Check that `.cursor/rules/` exists
- Restart Cursor

### MCP not working?

- Jira: Check credentials are configured
- Playwright: Ensure dev server is running

### AI not following rules?

- Be explicit: _"Following our coding standards, create..."_
- Reference specific patterns if needed

---

## Documentation

| Document                                                   | Purpose                        |
| ---------------------------------------------------------- | ------------------------------ |
| [GETTING_STARTED_AI.md](./GETTING_STARTED_AI.md)           | Comprehensive onboarding guide |
| [coding-standards.mdc](.cursor/rules/coding-standards.mdc) | Team coding standards          |
| [README.md](./README.md)                                   | Project setup and development  |
