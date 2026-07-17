# GitHub Actions Workflows

Index of workflows in this directory. Deep design notes (check-run model, merge pool, secrets, troubleshooting) live in [`ci-scripts/README.md`](../../ci-scripts/README.md). Slash-command help text is SSOT in [`../pr-commands.json`](../pr-commands.json) (`/help`).

**Prow/Tide are not used for this repo.** Gating E2E and merge automation run here.

## Hot Cluster E2E

| Workflow                              | Trigger                                | Role                                                            |
| ------------------------------------- | -------------------------------------- | --------------------------------------------------------------- |
| `hot-cluster-e2e.yml`                 | `workflow_dispatch` only               | Full E2E graph; publishes required **Run Gating Tests**         |
| `hot-cluster-e2e-run.yml`             | `workflow_call`                        | Build plugin image + run Playwright on ARC                      |
| `hot-cluster-check.yml`               | `workflow_call` (+ manual health)      | Cluster readiness / health                                      |
| `hot-cluster-e2e-pr-gate.yml`         | PR opened / synchronize / reopened     | Thin gate → dispatch `hot-cluster-e2e.yml`                      |
| `ok-to-test-gate.yml`                 | `ok-to-test` labeled                   | Thin gate for fork PRs                                          |
| `ok-to-test-reset.yml`                | synchronize while `ok-to-test` present | Remove `ok-to-test` when head moves                             |
| `retest-e2e.yml`                      | `/retest-e2e`                          | Cancel in-flight via concurrency groups; dispatch fresh run     |
| `retest-failed.yml`                   | `/retest-failed`                       | Re-run failed CI/PRV jobs; dispatch E2E if currently failing    |
| `cancel-e2e.yml`                      | `/cancel-e2e`                          | Cancel in-flight E2E without a new result                       |
| `hold-e2e.yml`                        | `/hold-e2e`                            | `e2e-hold` + neutral gating check; pauses dispatch              |
| `hot-cluster-e2e-cancel-on-close.yml` | PR closed                              | Cancel in-flight when PR closes                                 |
| `retest-stale-gating.yml`             | push to `main`                         | Mark checks stale; retest merge-pool PRs                        |
| `retest-on-pool-entry.yml`            | pool label add / blocking label remove | Retest when a PR newly becomes pool-eligible with a stale check |

## Merge automation (Prow / Tide replacements)

| Workflow                       | Trigger                       | Role                                                                                                                                   |
| ------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `auto-merge.yml`               | label / review / synchronize… | Required **Merge Gate** + enable/disable GitHub auto-merge                                                                             |
| `pr_validation_commands.yml`   | issue comment                 | `/lgtm`, `/approve`, `/hold` (+ cancel), `/ai-approved`, `/ci-approved`, `/recheck-jira`                                               |
| `pr_review_commands.yml`       | review submitted              | Captures review data only (no secrets -- see below), uploads artifact                                                                  |
| `pr_review_commands_sync.yml`  | `workflow_run` (after above)  | Approve / Request changes ↔ `lgtm` (+ `approved` for root OWNERS); split out since `pull_request_review` withholds secrets on fork PRs |
| `needs-rebase.yml`             | PR events + push to `main`    | Sync `needs-rebase` from GitHub `mergeable`                                                                                            |
| `verify-merge-pool-labels.yml` | labeled / unlabeled           | Strip untrusted UI `lgtm`/`approved`/`do-not-merge/hold`; restore untrusted hold removals                                              |
| `pr_help_command.yml`          | `/help`                       | Comment command list from `pr-commands.json`                                                                                           |

Pool eligibility (`isMergePoolPr`): `lgtm` + `approved`, and no blockers (`hold`, `e2e-hold`, `needs-rebase`, any `do-not-merge/*`). Label names: [`ci-scripts/hot-cluster/js/merge-pool-labels.cjs`](../../ci-scripts/hot-cluster/js/merge-pool-labels.cjs).

`/hold` blocks merge; `/hold-e2e` only pauses Hot Cluster E2E (different label: `do-not-merge/hold` vs `e2e-hold`).

## PR validation (OWNERS-gated paths)

| Workflow                   | Trigger                 | Role                                                  |
| -------------------------- | ----------------------- | ----------------------------------------------------- |
| `pr_validation.yml`        | `pull_request_target`   | Jira + AI-config + CI-scripts validation statuses     |
| `verify-review-labels.yml` | labeled (reviewed/skip) | Strip untrusted UI adds of AI/CI reviewed/skip labels |

Sensitive-path review uses `/ai-approved` and `/ci-approved` (`.github/OWNERS`), not `/approve`.

## Cluster lifecycle & manual console

| Workflow                             | Role                                                |
| ------------------------------------ | --------------------------------------------------- |
| `ibmc-cluster-setup.yml`             | Provision hot cluster (classic / vpc / ipi)         |
| `ibmc-cluster-teardown.yml`          | Tear down hot cluster                               |
| `ibmc-cluster-auto-teardown.yml`     | Cron: tear down idle clusters (~2h)                 |
| `ibmc-cleanup-all.yml`               | Aggressive cleanup of leftover IBM Cloud resources  |
| `deploy-manual-console.yml`          | Deploy OAuth console + plugin for manual UI testing |
| `deploy-manual-console-command.yml`  | `/deploy-manual-console`                            |
| `cleanup-manual-console-command.yml` | `/cleanup-manual-console`                           |
| `deploy-plugin.yml`                  | Rebuild/redeploy plugin only against manual console |

See [`ci-scripts/manual-console/README.md`](../../ci-scripts/manual-console/README.md).

## Other

| Workflow         | Role                                          |
| ---------------- | --------------------------------------------- |
| `ci_checks.yml`  | Unit tests, build, i18n, actionlint           |
| `deploy.yml`     | Build/push multi-arch Quay image on main/tags |
| `jira_clone.yml` | Jira clone helper                             |

## Shared helpers

| Path                                                                         | Used for                                                                      |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [`.github/actions/setup-gh-scripts`](../actions/setup-gh-scripts/action.yml) | Checkout validation scripts (+ `ci-scripts/hot-cluster/js` SSOT) and `npm ci` |
| [`.github/actions/create-bot-token`](../actions/create-bot-token/action.yml) | `kubevirt-plugin-bot` App token for label/comment/auto-merge writes           |
| [`.github/scripts/`](../scripts/)                                            | TypeScript for validation commands, merge-pool verify, Jira/AI/CI checks      |

Bot secrets: `BOT_APP_ID`, `BOT_APP_PRIVATE_KEY` (Issues + Pull requests write on the App). Details: [`ci-scripts/README.md`](../../ci-scripts/README.md#kubevirt-plugin-bot-required-for-prow-replacement-merge-automation).
