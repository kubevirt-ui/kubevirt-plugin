# GitHub Actions Workflows

Index of workflows in this directory. Deep design notes (check-run model, merge pool, secrets, troubleshooting) live in [`ci-scripts/README.md`](../../ci-scripts/README.md). Slash-command help text is SSOT in [`../pr-commands.json`](../pr-commands.json) (`/help`).

**Prow/Tide are not used for this repo.** Gating E2E and merge automation run here.

## Hot Cluster E2E

| Workflow                              | Trigger                                | Role                                                                                                                         |
| ------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `hot-cluster-e2e.yml`                 | `workflow_dispatch` only               | Full E2E graph; suite via `test_project` (+ optional `test_args`); publishes required **Run Gating Tests** only for `gating` |
| `hot-cluster-e2e-run.yml`             | `workflow_call` / `workflow_dispatch`  | Build plugin image + run Playwright on ARC                                                                                   |
| `hot-cluster-check.yml`               | `workflow_call` (+ manual health)      | Cluster readiness / health                                                                                                   |
| `hot-cluster-e2e-pr-gate.yml`         | PR opened / synchronize / reopened     | Thin gate → dispatch `hot-cluster-e2e.yml`                                                                                   |
| `pr-validation.yml`                   | All PR events (push + label)           | Unified PR validation: Jira, path checks, review labels, E2E dispatch, merge-pool sync                                       |
| `ok-to-test-reset.yml`                | synchronize while `ok-to-test` present | Remove `ok-to-test` when head moves                                                                                          |
| `hot-cluster-e2e-cancel-on-close.yml` | PR closed                              | Cancel in-flight when PR closes                                                                                              |
| `on-main-push.yml`                    | push to `main`                         | Mark checks stale; retest merge-pool PRs; sync needs-rebase                                                                  |

## Merge automation (Prow / Tide replacements)

| Workflow                      | Trigger                                   | Role                                                                                                                                   |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `auto-merge.yml`              | label / synchronize / `workflow_dispatch` | Publishes required **Merge Gate** status, verifies checks, squash-merges via bot when ready                                            |
| `pr-commands.yml`             | issue comment                             | Unified dispatcher for all PR commands (`/lgtm`, `/approve`, `/hold`, `/retest-e2e`, `/test-e2e`, etc.)                                |
| `pr_review_commands.yml`      | review submitted                          | Captures review data only (no secrets -- see below), uploads artifact                                                                  |
| `pr_review_commands_sync.yml` | `workflow_run` (after above)              | Approve / Request changes ↔ `lgtm` (+ `approved` for root OWNERS); split out since `pull_request_review` withholds secrets on fork PRs |
| `needs-rebase.yml`            | PR events                                 | Sync `needs-rebase` from GitHub `mergeable`                                                                                            |

Pool eligibility (`isMergePoolPr`): `lgtm` + `approved`, and no blockers (`hold`, `e2e-hold`, `needs-rebase`, any `do-not-merge/*`). Label names: [`.github/scripts/src/shared/merge-pool.ts`](../scripts/src/shared/merge-pool.ts).

`/hold` blocks merge; `/hold-e2e` only pauses Hot Cluster E2E (different label: `do-not-merge/hold` vs `e2e-hold`).

### Merge Gate commit status

`auto-merge.yml` runs [`.github/scripts/src/merge/auto-merge.ts`](../scripts/src/merge/auto-merge.ts), which publishes the required **Merge Gate** commit status on `labeled` / `unlabeled` / `synchronize` / `opened` / `reopened`, and on `workflow_dispatch` (woken by review sync or OWNERS `/lgtm`). Outcomes:

| State     | When                                                                         | Example description                        |
| --------- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| `pending` | Missing `lgtm`/`approved`, blocking labels, or required checks still running | `Missing lgtm`                             |
| `pending` | Branch requires an approving review that is not yet present                  | `Waiting for approving review`             |
| `pending` | Non-E2E required check failed (still in progress overall)                    | `Failed: build; Waiting: Run Gating Tests` |
| `failure` | **Run Gating Tests** failed, or script/merge error                           | `E2E tests failed`                         |
| `success` | Ready to merge / merged                                                      | `Merged`                                   |

Only E2E failure turns Merge Gate red; label waits, missing GitHub Approve, and other check gaps stay yellow/pending. Full merge-pool design: [`ci-scripts/README.md`](../../ci-scripts/README.md#merge-automation-prow--tide-replacement).

Merge Gate refreshes on `labeled`/`unlabeled`/`synchronize`/`opened`/`reopened`, and via `workflow_dispatch` after a human Approve (review sync) or OWNERS `/lgtm`/`/approve` (bot APPROVE). A `do-not-merge/*` label cleared via the ambient `GITHUB_TOKEN` (instead of the bot token) doesn't fire those events and leaves Merge Gate stale — see [Clearing a `do-not-merge/*` label via `GITHUB_TOKEN` does not wake `auto-merge.yml`](../../ci-scripts/README.md#clearing-a-do-not-mergelabel-via-github_token-does-not-wake-auto-mergeyml) in `ci-scripts/README.md`.

## PR validation (OWNERS-gated paths)

| Workflow            | Trigger               | Role                                                    |
| ------------------- | --------------------- | ------------------------------------------------------- |
| `pr-validation.yml` | `pull_request_target` | Jira status + AI/CI/i18n path labels (`do-not-merge/*`) |

Sensitive-path review uses `/ai-approved`, `/ci-approved`, and `/i18n-approved` (`.github/OWNERS`), not `/approve`. Blocking is via `do-not-merge/*` labels (Merge Gate); review label trust enforcement is handled by the label-gate route in `pr-validation.yml`.

## Cluster lifecycle & manual console

| Workflow                         | Role                                                |
| -------------------------------- | --------------------------------------------------- |
| `ibmc-cluster-setup.yml`         | Provision hot cluster (classic / vpc / ipi)         |
| `ibmc-cluster-teardown.yml`      | Tear down hot cluster                               |
| `ibmc-cluster-auto-teardown.yml` | Cron: tear down idle clusters (~2h)                 |
| `ibmc-cleanup-all.yml`           | Aggressive cleanup of leftover IBM Cloud resources  |
| `deploy-manual-console.yml`      | Deploy OAuth console + plugin for manual UI testing |
| `deploy-plugin.yml`              | Rebuild/redeploy plugin only against manual console |

See [`ci-scripts/manual-console/README.md`](../../ci-scripts/manual-console/README.md).

## Other

| Workflow        | Role                                          |
| --------------- | --------------------------------------------- |
| `ci_checks.yml` | Unit tests, build, lint, actionlint           |
| `deploy.yml`    | Build/push multi-arch Quay image on main/tags |

## `pull_request_target` Actions event policy

GitHub's default public-repo policy blocks `pull_request_target` (evaluate mode now; enforcement **2026-12-02**). See [Securely using pull_request_target](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target#default-policy-for-pull_request_target).

This repo keeps `pull_request_target` for fork-PR automation that needs secrets and a write token (labels, checks, bot App, Jira, E2E dispatch). An explicit repository Actions event policy allows it:

| Field              | Value                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy             | [Allow pull_request_target for fork-PR automation](https://github.com/kubevirt-ui/kubevirt-plugin/settings/actions/rules/12538) (id `12538`)            |
| Enforcement        | `active`                                                                                                                                                |
| Allowed event      | `pull_request_target` only                                                                                                                              |
| Targeted workflows | `pr-validation.yml`, `auto-merge.yml`, `hot-cluster-e2e-pr-gate.yml`, `hot-cluster-e2e-cancel-on-close.yml`, `needs-rebase.yml`, `ok-to-test-reset.yml` |

Those six workflows check out the **default branch** (trusted scripts under `.github/`) and do **not** execute PR-head code. E2E runs PR code only after a separate `workflow_dispatch` into `hot-cluster-e2e.yml` (write access required to dispatch).

Do not switch these workflows to `pull_request` without a redesign — fork PRs would lose secrets and write-token access. If you add another `pull_request_target` workflow, extend this policy's `workflow_path.include` (Settings → Actions → Policies, or `POST/PUT /repos/.../actions/policies`).

## Shared helpers

| Path                                                                                       | Used for                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`.github/actions/setup-gh-scripts`](../actions/setup-gh-scripts/action.yml)               | Checkout validation scripts (+ `ci-scripts/hot-cluster/js` SSOT) and `npm ci` |
| [`.github/actions/create-bot-token`](../actions/create-bot-token/action.yml)               | `kubevirt-plugin-bot` App token for label/comment/auto-merge writes           |
| [`.github/actions/clear-e2e-result-labels`](../actions/clear-e2e-result-labels/action.yml) | Remove `e2e-passed`/`e2e-failed` (shared by PR gate + on-main-push)           |
| [`.github/scripts/`](../scripts/)                                                          | TypeScript for validation commands, merge-pool verify, Jira/AI/CI checks      |

Bot secrets: `BOT_APP_ID`, `BOT_APP_PRIVATE_KEY` (Issues + Pull requests + Contents + Workflows + Actions write on the App; Workflows is required for auto-merge of PRs that touch `.github/workflows/*`; Actions is required for review sync / OWNERS `/lgtm` to `workflow_dispatch` Auto Merge). Details: [`ci-scripts/README.md`](../../ci-scripts/README.md#kubevirt-plugin-bot-required-for-prow-replacement-merge-automation).
