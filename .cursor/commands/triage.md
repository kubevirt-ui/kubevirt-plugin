# /triage -- CI Failure Triage Command

Analyze a failing CI job, classify the failure, and optionally retest.

Read `.cursor/rules/workflows/ci-triage.mdc` — it is the single source of truth for classification patterns, MCP tools, and action rules.

## Input Detection

Determine the PR to triage from the user's message:

1. **PR number** — e.g. `/triage 3809` or `/triage PR 3809`
2. **GitHub PR URL** — e.g. `/triage https://github.com/kubevirt-ui/kubevirt-plugin/pull/3809`
3. **Prow build URL** — e.g. `/triage https://prow.ci.openshift.org/view/gs/...`
4. **Current PR** — if no argument is given, detect the current branch and find its open PR

## Execution

Follow the steps in `.cursor/rules/workflows/ci-triage.mdc`: fetch → classify → report → act.
