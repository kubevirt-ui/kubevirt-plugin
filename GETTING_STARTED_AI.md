# Getting Started with AI Assistance

Welcome to the KubeVirt Plugin project! This guide will help you get the most out of the AI-powered development environment.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the System](#understanding-the-system)
3. [Your First Feature](#your-first-feature)
4. [Available Agents](#available-agents)
5. [Common Workflows](#common-workflows)
6. [Jira Integration](#jira-integration)
7. [Interactive Testing](#interactive-testing)
8. [Tips & Best Practices](#tips--best-practices)
9. [Cheat Sheet](#cheat-sheet)

---

## Quick Start

### 1. Open the Project

Open this project in Cursor IDE. All AI rules are automatically loaded.

### 2. Set Up Development Environment

```bash
npm install
npm run dev          # Terminal 1: Start dev server
npm run start-console # Terminal 2: Start console
```

### 3. Start Working

Just tell the AI what you want to do:

- _"Show my Jira tickets"_
- _"Start working on CNV-12345"_
- _"Create a new component for VM status"_
- _"Review my changes"_

That's it! The AI knows your project's standards and will guide you.

---

## Understanding the System

### What's Automatically Available

When you open this project, the AI has:

| Knowledge Area        | What It Knows                                |
| --------------------- | -------------------------------------------- |
| **Project Context**   | Architecture, folder structure, key concepts |
| **Coding Standards**  | TypeScript, React, SCSS conventions          |
| **Commands**          | All npm scripts and how to use them          |
| **Team Perspectives** | Developer, UX, QE, Security viewpoints       |
| **Workflows**         | How to create components, debug, prepare PRs |

### How Rules Work

Rules are in `.cursor/rules/` and apply automatically:

- **Always Active**: Core standards, project context, team review
- **File-Specific**: React rules when editing `.tsx`, SCSS rules for `.scss`
- **On-Demand**: Workflows and agents you invoke explicitly

### MCP Integrations

You have access to external tools:

| Service        | What You Can Do                          |
| -------------- | ---------------------------------------- |
| **Jira**       | Get tickets, update status, add comments |
| **Playwright** | Test UI interactively in browser         |
| **GitHub**     | Work with PRs, issues, code              |

---

## Your First Feature

### Step-by-Step Guide

#### 1. Find Your Ticket

```
"Show my assigned Jira tickets"
```

or

```
"Start working on CNV-12345"
```

The AI will:

- Fetch ticket details
- Summarize requirements
- Suggest where to start

#### 2. Understand the Codebase

```
"Where should I add this feature?"
"Show me similar components"
"How do we handle X in this project?"
```

#### 3. Implement

```
"Create a component for [feature]"
"Add [functionality] to [component]"
```

The AI follows your project's standards automatically.

#### 4. Test

```
"Add tests for my changes"
"Test this in the browser"
"Run all checks"
```

#### 5. Review

```
"Review my code"
```

Get feedback from Developer, UX, QE, and Security perspectives.

#### 6. Submit

```
"Prepare this for PR"
```

Generates PR description, runs checks, updates Jira.

---

## Available Agents

### Team Review (Always Active)

Automatically considers all perspectives when reviewing code.

### Deep-Dive Agents (On-Demand)

For thorough analysis from a specific perspective:

| Say This               | You Get                                             |
| ---------------------- | --------------------------------------------------- |
| _"as developer"_       | Code quality, architecture, performance analysis    |
| _"as ux"_              | Accessibility, user experience, PatternFly patterns |
| _"as qe"_              | Edge cases, test coverage, error scenarios          |
| _"as security"_        | Vulnerabilities, input validation, auth issues      |
| _"as kubevirt expert"_ | K8s patterns, VM lifecycle, API usage               |

### Example Usage

```
"As QE, what edge cases am I missing?"
"As UX, is this form accessible?"
"As security, review this input handling"
"As kubevirt expert, is this VM operation correct?"
```

---

## Common Workflows

### Creating a Component

```
"Create a new component for [purpose]"
```

AI creates proper folder structure, files, types, styles, and translations.

### Debugging

```
"Help me debug this issue"
"Why isn't this component updating?"
"This API call is failing, help me fix it"
```

### Code Review

```
"Review this code"              # Quick multi-perspective
"As developer, review this"     # Deep-dive specific
```

### Preparing a PR

```
"Is this ready for PR?"
"Prepare PR description for CNV-12345"
```

### Daily Standup Prep

```
"What did I work on yesterday?"
"Show my in-progress tickets"
```

---

## Jira Integration

### Get Your Tickets

```
"Show my assigned tickets"
"What's in the current sprint?"
"Find tickets about [topic]"
```

### Work on a Ticket

```
"Start working on CNV-12345"
```

- Fetches details and requirements
- Transitions to "In Progress"
- Suggests where to start

### Update a Ticket

```
"Add comment to CNV-12345: [message]"
"Move CNV-12345 to Code Review"
"Log 2 hours on CNV-12345"
```

### Complete a Ticket

```
"I'm done with CNV-12345"
```

- Adds completion comment
- Links to PR
- Transitions status

---

## Interactive Testing

### Using Playwright MCP

Ensure your dev server is running, then:

```
"Navigate to the VM list page"
"Click on the first VM"
"Take a screenshot"
"Test the creation form"
```

### Common Testing Tasks

```
"Test the VM creation flow"
"Check if the modal is accessible"
"Verify the form validation works"
"Take a snapshot after clicking Submit"
```

### Debugging with Playwright

```
"The button isn't working, let me see the page"
"Check for console errors"
"Show me the network requests"
```

---

## Tips & Best Practices

### Be Specific

```
❌ "Fix this"
✅ "Fix the null pointer error in VMList when no VMs exist"

❌ "Make a component"
✅ "Create a component for displaying VM status badges"
```

### Use Agents for Deep Analysis

```
# Quick check
"Review this code"

# Deep dive when needed
"As security, thoroughly review this form handling"
```

### Let AI Know Your Context

```
"I'm working on CNV-12345 which adds bulk delete"
"I'm updating the VM details page to show more info"
```

### Ask for Explanations

```
"Why does this pattern exist?"
"Explain how useK8sWatchResource works"
"What's the difference between VM and VMI?"
```

### Iterate

```
"That's not quite right, I need [clarification]"
"Can you also add [additional requirement]?"
"Let's try a different approach"
```

---

## Cheat Sheet

### Quick Commands

| Want To...       | Say...                        |
| ---------------- | ----------------------------- |
| Get my tickets   | _"Show my assigned tickets"_  |
| Start a task     | _"Start working on CNV-XXXX"_ |
| Create component | _"Create a component for X"_  |
| Add tests        | _"Add tests for this"_        |
| Review code      | _"Review my changes"_         |
| Prepare PR       | _"Prepare this for PR"_       |
| Debug issue      | _"Help me debug this"_        |
| Test in browser  | _"Test this page"_            |

### Agent Invocations

| Perspective | Say...                 |
| ----------- | ---------------------- |
| Developer   | _"as developer"_       |
| UX          | _"as ux"_              |
| QE          | _"as qe"_              |
| Security    | _"as security"_        |
| KubeVirt    | _"as kubevirt expert"_ |

### Workflow Triggers

| Workflow      | Triggered By...                         |
| ------------- | --------------------------------------- |
| New Component | _"create component"_, _"new component"_ |
| Debugging     | _"debug"_, _"troubleshoot"_, _"fix"_    |
| PR Prep       | _"prepare PR"_, _"ready for review"_    |
| Jira          | _"ticket"_, _"CNV-XXXX"_, _"jira"_      |
| Testing       | _"test"_, _"navigate"_, _"browser"_     |

### NPM Scripts

| Command                 | Purpose                 |
| ----------------------- | ----------------------- |
| `npm run dev`           | Start dev server        |
| `npm run start-console` | Start console container |
| `npm run check-types`   | TypeScript check        |
| `npm run lint`          | Lint check              |
| `npm test`              | Run unit tests          |
| `npm run i18n`          | Update translations     |

---

## Troubleshooting

### AI Not Following Standards

The AI should automatically follow project standards. If not:

- Be explicit: _"Following our coding standards, create..."_
- Reference rules: _"Use the patterns from react-components.mdc"_

### Jira Not Working

- Ensure Jira MCP is configured with valid credentials
- Check that you have access to the CNV project

### Playwright Not Working

- Ensure dev server is running (`npm run dev`)
- Check that the URL is accessible

### Rules Not Loading

- Verify you're in Cursor (not VS Code)
- Check `.cursor/rules/` directory exists
- Try restarting Cursor

---

## Getting Help

### Within the AI

```
"How do I [task]?"
"What's the best way to [approach]?"
"Explain [concept]"
```

### Documentation

- `GETTING_STARTED_AI.md` - This guide
- `.cursor/rules/coding-standards.mdc` - Team coding standards
- `README.md` - Project setup

### Team

- Slack: #kubevirt-ui
- Jira: CNV project

---

## Welcome to the Team!

You're now set up with AI-assisted development. The AI knows:

- Your project structure and patterns
- Your coding standards and conventions
- How to work with Jira and test interactively
- Multiple expert perspectives to help you succeed

Just start typing what you want to do, and let the AI guide you!
