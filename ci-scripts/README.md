# Hot Cluster CI

This directory contains scripts and documentation for the **IBM Cloud hot cluster** CI stack: an OpenShift cluster used for KubeVirt plugin E2E testing, with **Hyperconverged Cluster Operator (HCO)** and **GitHub Actions Runner Controller (ARC)** for self-hosted runners (`kubevirt-plugin-ci`).

Three infrastructure types are supported: **Classic ROKS**, **VPC ROKS** (recommended), and **IPI** (self-managed OpenShift).

**Prow/Tide are gone for this repo.** Gating E2E runs here; merge eligibility (`lgtm`/`approved`/`hold`/`needs-rebase`) and native auto-merge live in GitHub Actions. See [Prow/Tide → GitHub Actions Migration](#prowtide-github-actions-migration-complete-for-this-repo) below.

## Architecture

**Cluster lifecycle**

```
GitHub Actions
  ├── ibmc-cluster-setup.yml          → "IBM Cloud Hot Cluster Setup" (classic / vpc / ipi)
  ├── ibmc-cluster-teardown.yml       → "IBM Cloud Hot Cluster Teardown"
  └── ibmc-cluster-auto-teardown.yml  → "IBM Cloud Hot Cluster Auto-Teardown" (cron, 2h idle)
```

**E2E testing**

```
hot-cluster-e2e.yml     → "Hot Cluster E2E" (workflow_dispatch only -- never a direct PR trigger)
  ├── prepare (resolve cluster config, trust, PR context, initial progress status)
  ├── cluster-check (workflow_call → hot-cluster-check.yml; its `result` job
  │     also runs the manual health check, manual dispatch only)
  ├── progress-check-running-tests (advance progress status once cluster is ready)
  ├── run-e2e-tests (workflow_call → hot-cluster-e2e-run.yml)
  └── verify-gating-tests (publishes the required "Run Gating Tests" check;
        also syncs informational e2e-passed/e2e-failed labels)

PR entry points (thin gates that only dispatch the workflow above):
  ├── hot-cluster-e2e-pr-gate.yml   → opened/synchronize/reopened
  ├── ok-to-test-gate.yml           → ok-to-test labeled
  ├── retest-e2e.yml                → /retest-e2e
  ├── retest-stale-gating.yml       → main advanced (pool PRs)
  └── retest-on-pool-entry.yml      → newly pool-eligible + stale check

hot-cluster-e2e-run.yml → "Hot Cluster E2E Run"
  ├── build-kubevirt-plugin-image (podman build + push to ttl.sh)
  └── run-gating-tests (runs-on: kubevirt-plugin-ci) -- displays as "Execute tests"
        ├── ARC runner diagnostics (folded in, formerly a separate check-runner job)
        ├── ci-env-request → ci-env-controller → ci-test-stack
        ├── BRIDGE_BASE_ADDRESS from test stack
        └── Playwright gating (or features project)
```

**Merge automation (Prow/Tide replacements)**

```
auto-merge.yml                → Merge Gate check + enable/disable GitHub auto-merge
pr_validation_commands.yml    → /lgtm, /approve, /hold (+ cancel), /ai-approved, /ci-approved, /recheck-jira
pr_review_commands.yml        → Approve / Request changes reviews toggle lgtm (+ approved for OWNERS)
needs-rebase.yml              → sync needs-rebase from GitHub mergeable (PR events + push to main)
verify-merge-pool-labels.yml  → strip untrusted UI adds of lgtm/approved/do-not-merge/hold; restore untrusted hold removals
pr_help_command.yml           → /help from .github/pr-commands.json
```

Label name SSOT: [`hot-cluster/js/merge-pool-labels.cjs`](hot-cluster/js/merge-pool-labels.cjs). Bot App token helper: [`.github/actions/create-bot-token`](../.github/actions/create-bot-token/action.yml).

## Infrastructure Types

| Type        | Description                                    | IAM needed                                   | Cluster management        |
| ----------- | ---------------------------------------------- | -------------------------------------------- | ------------------------- |
| **classic** | IBM-managed ROKS on classic infrastructure     | K8s Admin + Classic Super User               | IBM manages control plane |
| **vpc**     | IBM-managed ROKS on VPC Gen2                   | K8s Admin + VPC Admin + COS auth             | IBM manages control plane |
| **ipi**     | Self-managed OpenShift via `openshift-install` | VPC Admin + COS Manager + DNS + IAM Identity | You manage everything     |

### VPC ROKS (recommended)

Uses standard IBM Cloud IAM (no SoftLayer/classic permissions). VPC, subnet, public gateway, and COS instance are auto-created and reused across runs.

- **Zone format**: `us-south-1`, `eu-de-1`
- **Flavor**: `bx2.8x32`, `cx2.4x8` (list with `ibmcloud oc flavors --zone <zone> --provider vpc-gen2`)
- **Required**: COS service-to-service authorization (`ibmcloud iam authorization-policy-create containers-kubernetes cloud-object-storage Reader`)

### Classic ROKS

Uses SoftLayer/classic infrastructure. VLANs are auto-discovered or created.

- **Zone format**: `wdc04`, `fra02`, `dal10`
- **Flavor**: `m3c.8x64`, `mb4c.4x32`
- **Required**: Classic Infrastructure Super User

### IPI (self-managed)

Uses `openshift-install` to create a fully self-managed OpenShift cluster on IBM Cloud VPC. No ROKS management fee; you own the control plane.

- **Zone format**: `us-south-1`, `eu-de-1`
- **Flavor**: `bx2-8x32` (hyphen format, auto-converted from dot format)
- **Base domain**: `cnv-ui.com` (registered in IBM Cloud CIS)
- **Required**: VPC Admin, COS Manager, DNS/CIS access, IAM Identity Admin, `OPENSHIFT_PULL_SECRET` GitHub secret

## Required GitHub Secrets

### IBM Cloud

| Secret                  | Description                                   | Required for |
| ----------------------- | --------------------------------------------- | ------------ |
| `IC_KEY`                | IBM Cloud IAM API key                         | All paths    |
| `OPENSHIFT_PULL_SECRET` | Red Hat pull secret (from console.redhat.com) | IPI only     |

### ARC Authentication (choose one)

| Secret                                                                           | Description                             |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| `ARC_GITHUB_APP_ID` + `ARC_GITHUB_APP_INSTALL_ID` + `ARC_GITHUB_APP_PRIVATE_KEY` | GitHub App (recommended)                |
| `ARC_GITHUB_PAT`                                                                 | Fine-grained PAT (simpler, less secure) |

### Optional

| Secret              | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL for credential notifications on cluster creation |

### kubevirt-plugin-bot (required for Prow-replacement merge automation)

| Secret                | Description                             |
| --------------------- | --------------------------------------- |
| `BOT_APP_ID`          | GitHub App ID for `kubevirt-plugin-bot` |
| `BOT_APP_PRIVATE_KEY` | GitHub App private key                  |

Used by `/lgtm`/`/approve`/`/hold`, review sync, `needs-rebase`, auto-merge GraphQL, e2e result labels, and related PR comment/label writes. The App installation must have **Issues: Read & write** and **Pull requests: Read & write**. Shared helper: [`.github/actions/create-bot-token`](../.github/actions/create-bot-token/action.yml).

Ghost runner cleanup reuses the ARC Authentication GitHub App credentials above (`ARC_GITHUB_APP_ID` + `ARC_GITHUB_APP_PRIVATE_KEY`) — no separate secret needed, since that app is already scoped to `administration: write`, exactly what deregistering offline runners requires.

## Setting Up the Hot Cluster

1. Go to Actions → **IBM Cloud Hot Cluster Setup** → Run workflow
2. Select infrastructure type, zone, flavor, worker count
3. Wait for completion (30-60 min depending on infrastructure type)

All paths converge after cluster creation: the workflow installs HCO, builds the ARC runner image, installs ARC controller + scale set, deploys the ci-env-controller, and runs health checks.

## Running E2E Tests

1. Actions → **Hot Cluster E2E** → Run workflow (or triggered on PR)
2. Health check verifies cluster is reachable
3. Plugin image is built and pushed to `ttl.sh` (2h TTL)
4. Test environment is provisioned via ci-env-controller (ConfigMap-driven)
5. Playwright gating tests run against the in-cluster console
6. Artifacts are uploaded, test environment is released

## Manual UI Testing

Actions → **Deploy Manual Console** deploys a persistent, OAuth-protected
console + kubevirt-plugin stack on an already-provisioned hot cluster, for
browsing branch UI code as a human instead of running automated tests. It
reuses `ci-env-controller` and the `ci-test-stack` Helm chart through a
separate, opt-in path (own trigger label, own namespace) with zero effect on
E2E behavior. See [`manual-console/README.md`](manual-console/README.md)
for the full architecture, credential model, and ConfigMap contract
additions.

## Teardown

**Manual:** Actions → **IBM Cloud Hot Cluster Teardown** (select infrastructure type)

**Automatic:** The auto-teardown workflow runs every 30 minutes and tears down the cluster after 2 hours of CI inactivity. It detects both ROKS clusters (via `ibmcloud oc`) and IPI clusters (via DNS probe).

For IPI teardown, the workflow auto-discovers the latest successful setup run to download the install state (`metadata.json`) needed by `openshift-install destroy cluster`. You can also provide `ipi_setup_run_id` manually to target a specific setup run.

## Security

- The kubeconfig is **not** uploaded as a workflow artifact (the repo is public and artifacts are downloadable by anyone).
- CI runners (ARC) access the cluster via their in-cluster service account.
- Manual cluster access: use the `ibmcloud` CLI with the `IC_KEY` API key, or use the kubeadmin credentials sent to Slack on cluster creation.

## Directory Structure

```
ci-scripts/
  _cluster-helpers.sh              (shared utility sourced by image build scripts)
  README.md
  hot-cluster/
    check-cluster-health.sh
    check-roks-cluster-state.sh
    cleanup-vpc-resources.sh
    configure-image-registry.sh
    configure-kubeconfig.sh
    create-ibmcloud-cco-secrets.sh
    create-ipi-cluster.sh
    install-hco.sh
    install-oc-client.sh
    ipi-install-config.yaml.tpl
    log-ibmcloud-iam-diagnostics.sh
    provision-vpc-resources.sh
    resolve-cluster-config.sh
    resolve-console-image.sh
    test-cleanup.sh
    arc/
    ci-env/
    helm/
    images/
    js/                             (.cjs helpers required from actions/github-script steps)
      merge-pool-labels.cjs         (SSOT for pool required + blocking label names)
      is-merge-pool-pr.cjs
      pr-command-helpers.cjs
      sync-needs-rebase-label.cjs
  manual-console/                  (manual UI testing -- see manual-console/README.md)
    ensure-manual-console-user.sh
    images/
      setup-plugin-image.sh
```

## Scripts

| Script                                            | Purpose                                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `hot-cluster/install-hco.sh`                      | Installs HCO operator, HPP storage, and virtctl                                                                |
| `hot-cluster/check-cluster-health.sh`             | Verifies cluster, HCO, ARC, storage, console                                                                   |
| `hot-cluster/check-roks-cluster-state.sh`         | Polls until ROKS cluster is ready                                                                              |
| `hot-cluster/log-ibmcloud-iam-diagnostics.sh`     | Logs IAM permissions for debugging (classic, VPC, and IPI)                                                     |
| `hot-cluster/cleanup-vpc-resources.sh`            | Single source of truth for VPC-resource cleanup by cluster-name prefix (setup, retries, teardown, cleanup-all) |
| `hot-cluster/create-ipi-cluster.sh`               | Creates IPI cluster with retry logic                                                                           |
| `hot-cluster/configure-kubeconfig.sh`             | Configures kubeconfig with DNS retry                                                                           |
| `hot-cluster/provision-vpc-resources.sh`          | Provisions VPC, subnet, and public gateway                                                                     |
| `hot-cluster/configure-image-registry.sh`         | Configures the internal image registry                                                                         |
| `hot-cluster/arc/install-arc-controller.sh`       | Installs ARC controller (once per cluster)                                                                     |
| `hot-cluster/arc/install-runner-scale-set.sh`     | Installs ARC runner scale set                                                                                  |
| `hot-cluster/ci-env/install-ci-env-controller.sh` | Installs the ConfigMap-driven CI environment controller                                                        |

See [`hot-cluster/arc/README.md`](hot-cluster/arc/README.md) for ARC-specific details and [`hot-cluster/ci-env/README.md`](hot-cluster/ci-env/README.md) for the ci-env-controller.

## Cluster & Test-Engine Resolution

`resolve-cluster-config.sh` picks the cluster name, OpenShift version, test engine, and CNV channel/pin for a run, from the PR's base branch (or `workflow_dispatch` overrides):

- **Release branches** (`release-<major>.<minor>`) get a dedicated cluster (`kubevirt-plugin-<major><minor>`) instead of sharing `kubevirt-plugin-ci`, and a CNV `startingCSV` pin to that major.minor -- `install-hco.sh` fails the build if no matching CSV exists, rather than silently installing a newer one.
- **Test engine**: `release-4.22` and earlier predate the Cypress-to-Playwright migration and still carry a `cypress/` suite; everything else (main, future releases, non-release bases) uses Playwright. An explicit `workflow_dispatch` override always wins over this auto-detection.
- **CNV channel**: always resolves to the catalog's real `stable` channel (there is no per-version `stable-4.X` channel); version pinning happens via `startingCSV`, not a different channel name.

## Check-Run & Retest Model

The hot-cluster pipeline manages its own required check ("Run Gating Tests") and an informational "Hot Cluster E2E Progress" status across several workflows (`hot-cluster-e2e.yml`, `hot-cluster-e2e-pr-gate.yml`, `hot-cluster-e2e-cancel-on-close.yml`, `retest-e2e.yml`, `cancel-e2e.yml`, `hold-e2e.yml`, `retest-stale-gating.yml`, `retest-on-pool-entry.yml`, `ok-to-test-gate.yml`) and the `publish-gating-check` action. A few GitHub behaviors drive the design:

- **`hot-cluster-e2e.yml` has no `pull_request_target` (or any other PR) trigger at all -- `workflow_dispatch` is its only `on:`.** Every job (and every nested job from a `uses:` reusable workflow) in its 5+-job graph gets its own native check-run the moment the workflow triggers, with no way to hide or nest them under "Hot Cluster E2E Progress" -- so a PR event landing on it directly means that whole graph shows up natively in the merge box. `hot-cluster-e2e-pr-gate.yml` (for `opened`/`synchronize`/`reopened`) and `ok-to-test-gate.yml` (for the `ok-to-test` label) are the only two `pull_request_target` listeners left; each is a single thin job that dispatches `hot-cluster-e2e.yml` via `workflow_dispatch` (`pr_number`, `base_ref`, `skip_pool_check: true`) instead of letting the PR trigger it directly. The merge box only ever shows that one thin-gate row plus the API-posted Progress/Run Gating Tests checks -- open the dispatched run itself (from Progress's `target_url`) for Prepare/cluster-check/Run E2E/Verify detail.
- **`pull_request_target` reads the workflow file from the base branch, not the PR.** GitHub Actions does this deliberately (a PR can't rewrite the workflow to steal secrets), which means a PR that changes `hot-cluster-e2e-pr-gate.yml`, `ok-to-test-gate.yml`, or `hot-cluster-e2e.yml` itself won't exercise its own new logic via a normal PR event until it's merged. Validate pipeline changes with a `workflow_dispatch` run against the PR's branch instead (`workflow_dispatch` reads the workflow file from whatever ref you dispatch to).
- **Trust for every `hot-cluster-e2e.yml` run funnels through one place: `resolve-pr-context`.** Since every PR path is now a `pr_number` dispatch (the thin PR gate, `ok-to-test-gate.yml`, a merge-pool retest, or `/retest-e2e`'s fallback), `should_run` and `verify-gating-tests`' untrusted-failure path both key off `resolve-pr-context`'s freshly-looked-up `trusted` output (OWNERS, same-repo branch, or the `ok-to-test` label) rather than the `pull_request_target` payload. A bare ad-hoc `workflow_dispatch` (no `pr_number`) always runs -- dispatching it at all already requires repo write access -- and skips the deeper Manual Cluster Health Check that only ad-hoc runs pay for.
- **Required checks must be published explicitly, not left to a job's own native check-run.** A job's native check-run is tied to its position/name within a specific workflow run; if a _later_ run of the _same workflow_ doesn't happen to include a job with that exact name (e.g. a differently-shaped no-op run), GitHub's rollup can stop showing an earlier successful result as "current" for that name, leaving branch protection stuck on "Expected -- waiting for status". `verify-gating-tests` therefore never relies on its own native check-run for "Run Gating Tests" -- it always publishes that check explicitly via `publish-gating-check`, for every `pr_number` dispatch. `verify-gating-tests`'s own display name is deliberately never the literal "Run Gating Tests" string, so it can't collide with the explicitly-published one.
- **Update the same check-run in place within one workflow run; only create a fresh one across separate runs.** `checks.update()` (unlike `checks.create()`) is only reliably permitted from a later job of the _same_ workflow run that created the check-run -- a genuinely separate run (a fresh `pr_number` dispatch, `/retest-e2e`, a stale-marker) has no id to reuse and must create its own. Within a single run, `prepare`'s "Supersede stale check" step creates the initial `in_progress` check-run and outputs its id (`gating_check_run_id`); `verify-gating-tests`' "Publish result for PR" step updates that _same_ check-run to its final `completed` result instead of creating a second entry. Two separate check-runs of the same name previously left the first stuck `in_progress` forever, since nothing ever transitioned it and GitHub's required-check evaluation didn't reliably treat the newer, separate entry as superseding the still-open older one (confirmed live on [PR #4336](https://github.com/kubevirt-ui/kubevirt-plugin/pull/4336): a passing completed check coexisted with an orphaned `in_progress` one, and the merge box kept showing "Expected -- waiting for status to be reported"). `verify-gating-tests` also closes out any _other_ still-open "Run Gating Tests" check-run it finds for the same commit (e.g. left behind by an earlier run that crashed or was cancelled before reaching this step), marking it `neutral`/superseded so it can't get stuck the same way. `retest-stale-gating.yml`'s stale-marking has no prior id to reuse either, so it still always creates a fresh check-run.
- **Bot labels don't trigger `hot-cluster-e2e.yml` at all -- only `ok-to-test` does, and only indirectly.** `labeled` used to be a direct trigger, so every bot label (`lgtm`, `approved`, `jira/valid-reference`, etc.) re-ran the full 5-job graph just to skip all 5 via `if:` -- 5 permanently-"Skipped" rows in the merge box per irrelevant label. There's no way to filter `on.pull_request_target.types` by which label was added, so `ok-to-test-gate.yml` is the only thing listening for `labeled`, dispatching `hot-cluster-e2e.yml` via `workflow_dispatch` only when the label is actually `ok-to-test` -- the same thin-gate pattern `hot-cluster-e2e-pr-gate.yml` applies to `opened`/`synchronize`/`reopened` above.
- **`is_pool_retest` distinguishes a real staleness retest from every other `pr_number` dispatch in the result wording.** All of `hot-cluster-e2e-pr-gate.yml`, `ok-to-test-gate.yml`, and `/retest-e2e`'s fallback dispatch a normal gating run for the PR at its current state, not a re-validation of an already-stale result -- they leave `is_pool_retest` at its default `false` so "Run Gating Tests" gets plain PR wording (e.g. "gating tests passed"). Only `retest-stale-gating.yml` and `retest-on-pool-entry.yml` set it `true`, since those two are the only dispatchers re-testing a PR specifically because `main` advanced past an already-completed result -- their titles/summaries keep the "(retest after main advanced)" framing.
- **Stale-after-main-advances**: `retest-stale-gating.yml` marks every open PR's check `neutral`/stale on every push to `main` (Tide's old re-test-before-merge guarantee, which the hot cluster doesn't get natively), then dispatches a real retest for merge-pool PRs only, using `hot-cluster-e2e.yml`'s `pr_number` input (plus `base_ref` and `is_pool_retest: true`) to test the PR merged with the new `main` tip. This applies to any open, non-pool PR shortly after its own gating tests pass, since `main` advances constantly -- it's expected, not a sign the pipeline is broken.
- **Never trust `refs/pull/<N>/merge` for "merged with the current base tip".** That ref is computed and cached by GitHub, refreshed only reactively (e.g. a push to the PR or its base), and can silently go stale for an idle PR while `main` keeps advancing -- confirmed live: a `pr_number` retest tested a `main` snapshot 4 commits behind the real tip, and the checked-out code proved it (an already-superseded implementation was still present). All `pr_number` retest paths therefore check out the current base tip directly (`github.sha`, always accurate since these dispatches only ever target `ref: main`) and merge the PR's actual head onto it via a plain local `git merge`, in `checkout-for-retest`. Never reintroduce `refs/pull/<N>/merge` as a shortcut here.
- **Pool-entry is a second, narrower trigger for the same staleness problem.** `retest-stale-gating.yml` only re-evaluates merge-pool membership on a push to `main` -- a PR that gains `lgtm`+`approved` (or loses a blocking label) afterward, while its check is still that push's stale marker, gets no further trigger until `main` next advances or someone manually intervenes. `retest-on-pool-entry.yml` closes that specific gap: on `labeled` (`lgtm`/`approved`) or `unlabeled` (`hold`, `needs-rebase`, or any `do-not-merge/*`) events, it checks fresh pool eligibility and whether the current check is still the stale marker, and only then dispatches a real retest (with `base_ref` and `is_pool_retest: true`, same as `retest-stale-gating.yml`) -- kept deliberately narrow (not "every open PR, every label change") for the same cluster-cost reasons as the two-tier split above. It deliberately does **not** match `e2e-hold` unlabeled: only `/retest-e2e` lifts that hold and dispatches a fresh run (see `/hold-e2e` below). Any race between the two workflows' dispatches for the same PR is already handled safely by `cluster-check`/`run-e2e-tests`'s own job-level concurrency groups.
- **Every `pr_number` dispatch must pass `base_ref`, or a release-branch PR tests against the wrong base.** `resolve-cluster-config.sh` picks the cluster/test-engine from `base_ref` (see "Cluster & Test-Engine Resolution" below), and `checkout-for-retest` falls back to `github.sha` (`main`'s tip) when `base_ref` is empty -- for a PR targeting `release-4.x`, that would silently merge the PR onto `main` instead of its own release branch. `hot-cluster-e2e-pr-gate.yml`, `ok-to-test-gate.yml`, `/retest-e2e`'s fallback, `retest-stale-gating.yml`, and `retest-on-pool-entry.yml` all look up `pr.base.ref` fresh and forward it.
- **`/retest-e2e` always dispatches a fresh run -- it never calls `reRunWorkflow`.** A re-run reuses the original dispatch's cached base SHA instead of merging with the current base tip (the same reason `retest-stale-gating.yml` always dispatches fresh rather than re-running), so `/retest-e2e` unconditionally `createWorkflowDispatch`es with `pr_number`/`base_ref`/`skip_pool_check: true`, exactly like its own in-progress-cancellation path already did. It still scans recent runs for a `PR#<number> retest` token in `run-name:` (since a `pr_number` dispatch runs against `ref: main` and carries no normal PR/SHA/branch match signal) -- but only to decide the comment's wording: if a match is still non-`completed`, it says the in-progress run was cancelled via the shared concurrency groups and a fresh one dispatched; otherwise it says a fresh run was dispatched outright. A short, fixed lookback window here previously caused a false "no recent run found" comment when the real prior run had simply aged out of the window (it's a comment-wording concern only, not "whether to dispatch" -- the dispatch always happens either way).
- **`/cancel-e2e` and closing a PR cancel by entering the same job-level concurrency groups, not by calling the cancel API.** Neither `cancel-e2e.yml` nor `hot-cluster-e2e-cancel-on-close.yml` relies on `cancelWorkflowRun()` alone -- that only cancels a superseded run's own bookkeeping and doesn't actually stop a `uses:` job (same limitation described below). Both instead detect the PR's active run via the `PR#<number> retest` `run-name:` token (`hot-cluster-e2e-cancel-on-close.yml` no longer has any `pull_request_target`-run runs to search for, since `hot-cluster-e2e.yml` doesn't produce them anymore), then have dedicated jobs enter `hot-cluster-check-<PR#>` / `hot-cluster-run-e2e-<PR#>` directly (identical group keys, no dispatch indirection needed since concurrency groups are keyed by a plain string across the whole repository) and immediately no-op, which is what actually terminates whatever currently holds those groups. Neither touches "Run Gating Tests" -- only the informational progress status -- since a cancellation isn't a test result.
- **`/hold-e2e` pauses testing by combining a durable label with the same non-passing check-run pattern `retest-stale-gating.yml` already uses.** Unlike a cancellation, a hold _is_ meant to affect "Run Gating Tests": `hold-e2e.yml` cancels any in-flight run via the same job-level concurrency-group-entry trick as `/cancel-e2e`, adds an `e2e-hold` label to the PR, and publishes a `completed`/`neutral` "held via /hold-e2e" marker via `publish-gating-check` (a fresh check-run, same as any other cross-run "retry" -- see above). The label is what survives future events: `hot-cluster-e2e-pr-gate.yml` and `ok-to-test-gate.yml` both skip their dispatch while it's present, and `is-merge-pool-pr.cjs` excludes it from the merge pool so `retest-stale-gating.yml` won't dispatch a real retest for a held-but-`lgtm`+`approved` PR either. **Skipping dispatch alone is not enough on a later push** -- the held marker is SHA-scoped, so a synchronize/reopen/force-push would otherwise leave the new HEAD with no "Run Gating Tests" result at all (GitHub: "Expected -- waiting for status"; confirmed live on [PR #4349](https://github.com/kubevirt-ui/kubevirt-plugin/pull/4349)). `hot-cluster-e2e-pr-gate.yml` therefore runs a second job (`republish-hold`) whenever `e2e-hold` is present, re-publishing the same neutral marker onto `pull_request.head.sha` without dispatching a cluster run. Only `/retest-e2e` removes the label (as well as dispatching a fresh run) -- `retest-on-pool-entry.yml`'s `unlabeled` trigger deliberately only matches `hold`/`do-not-merge/*`, not `e2e-hold`, so removing the label by itself (e.g. via the UI) never auto-fires a retest; the explicit command is the only way to both lift a hold and get a fresh result. The label removal is placed _after_ `/retest-e2e`'s dispatch succeeds, not before, so a failed dispatch leaves the hold in place instead of lifting it with no fresh run to show for it. `verify-gating-tests` also re-checks the `e2e-hold` label live, immediately before publishing any real result -- this closes a race the concurrency-group cancellation alone can't: if `cluster-check`/`run-e2e-tests` already finished by the time a hold lands, there's nothing left in their groups to cancel, and this job would otherwise publish a real pass/fail over top of the hold's own neutral marker. As with any plain GitHub label, `e2e-hold` isn't itself OWNERS-gated against removal via the UI (only `/hold-e2e`'s own application is) -- the same trust model Prow's own `hold`/`do-not-merge/*` labels already have.
- **`/retest-e2e`, `/cancel-e2e`, and `/hold-e2e` all authenticate their issues-scope calls (labels, comments, reactions) through the `kubevirt-plugin-bot` GitHub App, never `GITHUB_TOKEN`.** `GITHUB_TOKEN`'s `issues` scope is forced read-only for a PR from a fork, regardless of what `permissions:` a workflow declares -- confirmed live: the token's own "Permissions" log listed `Issues: write`, yet every such API call still 403'd "Resource not accessible by integration". `checks`/`statuses` writes are unaffected by this and still use the ambient `GITHUB_TOKEN` (see each workflow's own `permissions:` comment for exactly which scope it keeps and why). Each job generates its own bot token via `actions/create-github-app-token@v3` (jobs don't share step outputs), requesting only the `permission-*` scopes it needs; `reactToComment`/`enforceCommentTrust` in [`hot-cluster/js/pr-command-helpers.cjs`](hot-cluster/js/pr-command-helpers.cjs) are shared by all three so the reaction/trust-check logic isn't triplicated.
- **Request `permission-pull-requests: write` on the bot token, not just `permission-issues: write`, for anything that labels, comments on, or reacts to a PR.** GitHub's REST docs list labels/comments/reactions under `/issues/...` paths and say `issues: write` OR `pull-requests: write` should suffice -- but confirmed live, a GitHub App installation token with only `issues: write` still 403'd "Resource not accessible by integration" on `addLabels`/`createComment`/reactions once the target `issue_number` actually resolved to a pull request (every case in this repo, since these commands only ever fire on PRs). `permission-issues: write` is kept alongside it only for the repo-level `createLabel` call in `hold-e2e.yml` (creating the `e2e-hold` label itself isn't PR-scoped). The App's own installation permissions must have "Pull requests: Read & write" granted, not just "Issues: Read & write" -- check this first if a 403 recurs.
- **Real cancellation has to live at the job level, not the workflow level.** `hot-cluster-e2e.yml` deliberately has no workflow-level `concurrency:` block. A workflow-level group with `cancel-in-progress: true` holds an _entire new run_ at pending (zero jobs, not even `Prepare`) until the older run in the same group reaches a terminal state -- and a `uses:` job (a job that calls a reusable workflow, like `cluster-check` or `run-e2e-tests`) never actually gets killed by that cancellation, so the older run's self-hosted E2E job keeps running to completion untouched and the group never frees. The new run would then never start at all, let alone cancel anything. Instead, `cluster-check` and `run-e2e-tests` each carry their own job-level `concurrency:` group (PR-scoped, own suffix so they don't cancel each other): cheap jobs (`Prepare`, progress/verify) run immediately on every trigger with no gating, and only the two jobs that cost real cluster time enforce "one at a time per PR" -- which GitHub does properly honor for job-level groups, including ones backed by a reusable workflow. Any brief overlap in the cheap jobs' postings is harmless given the same-run check-run update above. `/retest-e2e` relies on the same job-level groups: it always dispatches a fresh run (see above), whose `cluster-check`/`run-e2e-tests` jobs cancel a still-running match via these groups rather than erroring out or racing it.

## Tide Required-Context Gotcha (historical)

**Tide is no longer used for this repo** (see the next section). The note below remains only as migration context for other repos still on Prow/Tide.

If a required check is published by a GitHub Action (`checks.create()`) rather than a native Prow presubmit, do not rely on Tide's `context_options.from-branch-protection: true` default to treat it as merge-blocking -- it silently didn't for this repo ([PR #4225](https://github.com/kubevirt-ui/kubevirt-plugin/pull/4225) merged while "Run Gating Tests" had never run). Repos still on Tide need an explicit `required-contexts` override in `openshift/release`. This repo now blocks merge via GitHub branch protection + the native **`Merge Gate`** check from `auto-merge.yml` instead.

See [openshift/release#81840](https://github.com/openshift/release/pull/81840) for the Tide-era fix that was applied here before Prow was removed.

## Prow/Tide → GitHub Actions Migration (complete for this repo)

Tide/Prow are **no longer connected** to `kubevirt-plugin` -- the `openshift-ci` GitHub App has been uninstalled/deselected for this repo (still installed org-wide for other repos). This is permanent: every Prow plugin previously configured here (`lgtm`, `approve`, `hold`, `needs-rebase`, `wip`, `blunderbuss`, `lifecycle`, `retitle`, `jira-lifecycle-plugin`, etc.) is dead.

Hot Cluster E2E already replaced Prow's **gating test execution**. The pieces below replace Tide's **merge eligibility + merge execution** and the Prow label/command plugins that fed them.

### What replaced what

| Prow / Tide piece                         | In-repo replacement                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tide merge pool + merge                   | `auto-merge.yml`: native GitHub auto-merge + required **`Merge Gate`** check                               |
| Tide pool eligibility (`lgtm`+`approved`) | `isMergePoolPr` in [`hot-cluster/js/is-merge-pool-pr.cjs`](hot-cluster/js/is-merge-pool-pr.cjs)            |
| Label name SSOT                           | [`hot-cluster/js/merge-pool-labels.cjs`](hot-cluster/js/merge-pool-labels.cjs)                             |
| `/lgtm`, `/approve`, `/hold` (+ cancel)   | `pr_validation_commands.yml` + `.github/scripts/.../commands/{lgtm,approve,hold}.ts`                       |
| Review acts as lgtm                       | `pr_review_commands.yml` + `commands/review-event.ts`                                                      |
| `needs-rebase` plugin                     | `needs-rebase.yml` + `hot-cluster/js/sync-needs-rebase-label.cjs`                                          |
| Anti-bypass for pool labels               | `verify-merge-pool-labels.yml` (strips untrusted UI adds; restores untrusted `do-not-merge/hold` removals) |
| Presubmit / gating E2E                    | Hot Cluster E2E (`hot-cluster-e2e.yml` via thin PR gates) + required **`Run Gating Tests`** check          |
| `/retest`, cancel, hold-for-tests         | `/retest-e2e`, `/cancel-e2e`, `/hold-e2e` (E2E-only; not the same as `/hold`)                              |
| `/help` command list                      | `pr_help_command.yml` reading `.github/pr-commands.json`                                                   |

Only the merge-critical plugins above are replaced. `wip`, `blunderbuss`, `lifecycle`, `retitle`, etc. remain known gaps (see Known limitations below).

### Merge eligibility (replaces Tide's pool)

A PR is merge-pool eligible when **all** of the following hold (`isMergePoolPr`):

1. Has **`lgtm`**
2. Has **`approved`**
3. Has **no blocking labels**: exact `hold`, `e2e-hold`, `needs-rebase`, or any `do-not-merge/*` (including `do-not-merge/hold`)

`auto-merge.yml` then:

- Publishes required check **`Merge Gate`** (`success` iff eligible, else `failure` -- the real merge backstop)
- Enables/disables GitHub native auto-merge via the bot App (GraphQL; `GITHUB_TOKEN` cannot do this)

Branch protection must require **`Merge Gate`** and **`Run Gating Tests`** (plus build/test as before).

### Required Setup Steps

To move a repo onto this native model (already done for `kubevirt-plugin`):

1. **Enable "Allow auto-merge"** in repo Settings -> General -> Pull Requests.
2. **Add `Merge Gate` to branch protection's required status checks** on the default branch (alongside `Run Gating Tests`, `build`, `test`, etc.).
3. **Install/configure `kubevirt-plugin-bot`** with Issues + Pull requests write; set `BOT_APP_ID` / `BOT_APP_PRIVATE_KEY` secrets.
4. **Confirm the root `OWNERS` file lists real approvers** -- `/approve` and `/lgtm`'s approve-acting behavior both read it.
5. **Uninstall/deselect the Prow GitHub App (`openshift-ci`) for this repo**. Removing the `tide:` block from `openshift/release` is optional hygiene afterward.
6. **Announce the command set** -- `/help` or the table below. Reviews with `/lgtm` in the body now always honor Approve/Request-changes state (no Prow-style silent no-op).

### `/lgtm`, `/approve`, `/hold` and their `cancel` variants

Commands in `pr_validation_commands.yml` (`.github/scripts/src/validation/commands/{lgtm,approve,hold}.ts`), alongside `/ai-approved`/`/ci-approved`/`/recheck-jira`. `parse-command.ts` accepts an optional trailing `cancel` (e.g. `/lgtm cancel`); word-boundary matching rejects `/hold-e2e` as `/hold`.

| Command           | Label                                           | Who can use it                                                                                |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/lgtm`           | `lgtm`                                          | Any repo collaborator with write access, except the PR's own author (Prow's original default) |
| `/lgtm cancel`    | `lgtm` (removed); OWNERS also remove `approved` | Any write-access collaborator, including the PR's own author                                  |
| `/approve`        | `approved`                                      | Root `OWNERS` approvers only (PR author cannot `/approve` their own PR)                       |
| `/approve cancel` | `approved` (removed)                            | Root `OWNERS` approvers only                                                                  |
| `/hold`           | `do-not-merge/hold`                             | Any repo collaborator with write access (Prow's original default)                             |
| `/hold cancel`    | `do-not-merge/hold` (removed)                   | Any repo collaborator with write access                                                       |

- **`/lgtm` acts as `/approve` too** (mirrors Prow's `lgtm_acts_as_approve`): a root `OWNERS` approver's `/lgtm` also grants `approved`. Their `/lgtm cancel` also revokes `approved` (mirrors Request-changes).
- **Trust checks**: `/lgtm`/`/hold` use `isWriteCollaborator`; `/approve` uses root `OWNERS` via `isListedInOwners`. Logins compared case-insensitively. Auth denials react `-1` and leave a short `@user: …` why-comment.
- **Label names** come from [`hot-cluster/js/merge-pool-labels.cjs`](hot-cluster/js/merge-pool-labels.cjs) (SSOT for `isMergePoolPr` and TS grant/revoke helpers).

### Native GitHub reviews also toggle `lgtm`/`approved`

`pr_review_commands.yml` (`pull_request_review: [submitted]`, entrypoint `commands/review-event.ts`) mirrors Prow's `review_acts_as_lgtm` convenience: an "Approve" review grants `lgtm` (+ `approved` if the reviewer is a root OWNERS approver); a "Request changes" review removes them. Same write-collaborator/OWNERS-approver checks as the comment commands, and the same self-review restriction (a PR author's own review never toggles anything).

**Deliberately simpler than Prow's original behavior**: Prow's real `lgtm` plugin skips handling a review entirely if its body text contains `/lgtm` or `/lgtm cancel` -- a genuinely confusing interaction (an "Approve" review with `/lgtm` typed in the body did _nothing_, neither the literal command nor the review-state auto-behavior), which is exactly what made the PR #4363 investigation so confusing in the first place. This implementation has no such special case: the review's **state** (`APPROVED`/`CHANGES_REQUESTED`) is always honored, regardless of anything typed in its body.

No PR comment or reaction is posted for a review-triggered change (reviews don't support reactions the way issue comments do) -- a routine skip (non-collaborator, self-review) just logs and exits normally.

### `/hold` vs `/hold-e2e` -- do not confuse these

`/hold` (this section) blocks the PR from merging at all, via `isMergePoolPr`. `/hold-e2e` (see the Check-Run & Retest Model section above) only pauses **Hot Cluster E2E** dispatch -- a completely different, narrower mechanism using its own `e2e-hold` label. Both happen to block merge (since `is-merge-pool-pr.cjs` also excludes `e2e-hold`), but only `/hold-e2e` also stops new cluster runs from being dispatched; `/hold` does not.

### `needs-rebase` label

`needs-rebase.yml` replaces Prow's `needs-rebase` plugin (also historically part of Tide's `missingLabels`). Two triggers, following the same `list-open-prs` -> per-PR matrix pattern as `retest-stale-gating.yml`:

- `pull_request_target: [opened, synchronize, reopened]` -- checks just that PR.
- `push: [main]` -- re-checks every open PR targeting `main`, since a conflict can newly appear only because the base moved, which the PR's own events can't catch.

Both call the shared `hot-cluster/js/sync-needs-rebase-label.cjs`, which re-fetches the PR and reads GitHub's own computed `mergeable` field (never re-implements conflict detection itself):

- `false` -> apply `needs-rebase` + a marker-deduped explanatory comment (`<!-- needs-rebase-comment -->`)
- `true` -> remove the label and delete any marker comments
- `null` (not yet computed) -> skip this pass; a later event retries

Per-PR concurrency (`needs-rebase-<PR#>`, `cancel-in-progress: false`) avoids racing label/comment writes. Label/comment writes use the `kubevirt-plugin-bot` App token (`permission-issues: write` + `permission-pull-requests: write`), not `GITHUB_TOKEN` -- same reason as `/hold-e2e` / e2e result labels. `isMergePoolPr` also excludes `needs-rebase` -- mostly belt-and-suspenders, since GitHub's native merge already refuses a genuinely-conflicting PR, but it makes `Merge Gate` explain _why_ an otherwise-eligible-looking PR is stuck.

### `e2e-passed`/`e2e-failed` labels

Purely informational, PR-list-visible mirror of Hot Cluster E2E's latest _real_ result -- **not** a merge gate (`isMergePoolPr` doesn't read these; the required "Run Gating Tests" check-run is still the actual gate). Added by a new step in `hot-cluster-e2e.yml`'s `verify-gating-tests` job, right after "Publish result for PR": `success` -> `e2e-passed` (+ remove `e2e-failed`); `failure` -> `e2e-failed` (+ remove `e2e-passed`); `neutral` (held/stale/non-real results) -> skipped entirely, leaving whichever label already reflects the last real result untouched. Label writes go through the `kubevirt-plugin-bot` App token (`permission-issues: write` + `permission-pull-requests: write`), same reason as `/hold-e2e`'s `e2e-hold` -- not `GITHUB_TOKEN`.

### `enablePullRequestAutoMerge` needs the bot token, not `GITHUB_TOKEN`

Confirmed live on PR #4363: even with `Merge Gate` correctly reporting `success`, `auto-merge.yml`'s GraphQL call to `enablePullRequestAutoMerge` failed with `Resource not accessible by integration` -- **regardless of the workflow's `permissions:` block**. `enablePullRequestAutoMerge`/`disablePullRequestAutoMerge` are two of a small set of mutations GitHub blocks for the default Actions bot identity as a platform restriction, not a scope you can widen your way around. Fixed by generating a `kubevirt-plugin-bot` App token (via [`.github/actions/create-bot-token`](../.github/actions/create-bot-token/action.yml) or `actions/create-github-app-token@v3` directly) and passing it as `github-token:` to that GraphQL step -- eligibility-check and Merge-Gate-publishing steps stay on the default token.

### Known limitations

- **`lgtm`/`approved` are single shared PR-level booleans, not per-approver tracked.** Prow's real `approve` plugin runs a set-cover algorithm across every OWNERS file touched by the PR's changed files, tracking which specific approver covers which file. This implementation has no notion of "which files are covered by whom" -- one OWNERS approver's `/approve` (or Approve review) satisfies the whole PR, same simplification the rest of this repo's label-based trust model already makes elsewhere.
- **UI-applied `ai-config-reviewed`/`ci-scripts-reviewed`/skip labels are OWNERS-verified** by `verify-review-labels.yml` (strips untrusted adds). **UI-applied `lgtm`/`approved`/`do-not-merge/hold` are verified the same way** by `verify-merge-pool-labels.yml`, using the matching slash-command trust rules (write collaborator for `lgtm`/`hold`, root OWNERS for `approved`, no self-`lgtm`/`approved`; `kubevirt-plugin-bot[bot]` exempt so command/review paths keep working). Untrusted UI removal of `do-not-merge/hold` is also restored (bot or write collaborator removals, including `/hold cancel`, are left alone). Other pool-adjacent labels (`e2e-hold`, bare `hold`, `needs-rebase`) are not covered by that watcher.
- **The rest of the dead Prow plugin list is unaddressed.** `wip` (title-based work-in-progress gating), `blunderbuss` (auto-assign reviewers), `lifecycle` (stale issue/PR management), `retitle`, `jira-lifecycle-plugin` (likely redundant with this repo's own `jira-validation` already), and the rest have no in-repo replacement. `wip` is the next most likely to matter for merge-safety if it comes up again.
- **`openshift/release`'s `_prowconfig.yaml` `tide:` block removal ([#82022](https://github.com/openshift/release/pull/82022)) is now moot for functionality**, since Tide can't reach this repo at all with the App uninstalled -- landing it is optional config hygiene, not a blocker.

## CI-Scripts & AI-Config Validation (OWNERS-Gated Merge Blocking)

`ai-config-validation` and `ci-scripts-validation` (`.github/scripts/src/validation/ai-config-validation/`, `.github/scripts/src/validation/ci-scripts-validation/`, both thin wrappers around the shared `.github/scripts/src/validation/pr-path-validation/` core) block merging until an OWNERS-listed reviewer signs off on changes to sensitive paths:

| Check                   | Protected paths                                                                                                                                                                                                         | Alert label          | Block label                      | Reviewed label        | Skip label              | Approve command |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------- | --------------------- | ----------------------- | --------------- |
| `ai-config-validation`  | `.cursor/`, `.claude/`, `.vscode/`, `.gemini/`, `.codex/`, `.windsurf/`, `.coderabbit.yaml`, `AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.github/scripts/`, the two `pr_validation*.yml` workflows | `ai-config-changed`  | `do-not-merge/ai-config-review`  | `ai-config-reviewed`  | `skip-ai-config-check`  | `/ai-approved`  |
| `ci-scripts-validation` | `.github/`, `ci-scripts/`, `Dockerfile`, `playwright-runner-hc-e2e.sh` (confirmed CI-invoked; other root-level scripts checked and ruled out as local-dev-only)                                                         | `ci-scripts-changed` | `do-not-merge/ci-scripts-review` | `ci-scripts-reviewed` | `skip-ci-scripts-check` | `/ci-approved`  |

Both checks run unconditionally on every PR (`pull_request_target: [opened, synchronize, reopened, edited]` in `pr_validation.yml`, no path filter) -- the path-sensitivity decision happens inside the script, not as a workflow-level filter, so the common "doesn't touch these paths" case always resolves to a fast `success`. `/ai-approved`/`/ci-approved` (via `pr_validation_commands.yml`, `issue_comment`-triggered) both check the commenter against **`.github/OWNERS`** (`no_parent_owners: true`, kept in sync with `.cursor/OWNERS`) at the PR's _base_ ref, never the PR's own branch -- so a PR can't self-approve by editing OWNERS in its own diff. A new commit to a sensitive path clears the "reviewed" label and re-blocks, same as `ai-config-reviewed` always did.

`pr_validation.yml` runs Jira, AI-config, and CI-scripts validation from a single `pr-validation` job/script (`src/validation/pr-validation/index.ts`), not three separate jobs -- one checkout, one PR-files fetch shared between AI-config and CI-scripts (each used to fetch it independently), and each check still isolated from the others' failures so one bad check can't suppress the other two's status. The three status contexts (`jira-validation`, `ai-config-validation`, `ci-scripts-validation`), their labels, and the independent `/recheck-jira`/`/ai-approved`/`/ci-approved` commands are unchanged by this -- only the workflow/execution structure was consolidated.

- **The label alone was not actually merge-blocking -- verified, not assumed.** Before this was fixed, `required_status_checks.contexts` on `main` (`gh api repos/.../branches/main/protection`) listed only `"Run Gating Tests"`; `ai-config-validation`'s own status was never in it, there's no push/merge restriction, and `require_code_owner_reviews` is `false` (this repo has no native `CODEOWNERS`, only Prow-style `OWNERS` files, which GitHub doesn't read for review gating). Net effect: an unreviewed AI-config change could be merged by a human clicking GitHub's native Merge button, with nothing technical stopping it.
- **Fix applied: both `ai-config-validation` and `ci-scripts-validation` are required status checks on `main`.** Plain repo-settings changes (`gh api -X PATCH .../branches/main/protection/required_status_checks`), no external dependency, and both block the native Merge button directly. `ci-scripts-validation` was added via an admin force-merge of its own introducing PR specifically -- `pr_validation.yml` is `pull_request_target`-triggered, which reads the workflow file from the base branch, not the PR, so the job (and its status) can't exist on `main` until that PR merges; adding it as a required check any earlier would have deadlocked that PR's own merge.
- **The reviewed/skip labels alone are not the trust boundary -- `verify-review-labels.yml` closes that gap.** `runPathValidation`'s `passed` computation only checks label _presence_, which can't distinguish a label added by `/ai-approved`/`/ci-approved` from one added directly via the GitHub UI by anyone with triage/write access. `verify-review-labels.yml` (`pull_request_target: [labeled]`, same thin-gate pattern as `ok-to-test-gate.yml` so irrelevant labels are a no-op) checks the label-applier against `.github/OWNERS` and strips the label immediately if they're not listed, then re-runs validation so the status/other labels reflect the corrected state.
- **Bot-applied reviewed labels must be exempted from that same check, or the fix breaks the thing it protects.** `/ai-approved`/`/ci-approved` add the label via the `kubevirt-plugin-bot` token -- the resulting `labeled` event's `sender` is the bot account, not the commenter who was already checked against OWNERS in `commands/approve.ts`. `verify-review-labels` exempts only the exact `kubevirt-plugin-bot[bot]` login, not any `*[bot]` sender -- trusting every bot/app with label-write access would let a third-party app bypass review on the reviewed _and_ skip-\* labels alike. Caught by this session's own follow-up security review, not by the first pass.
- **The AI-config/CI-scripts overlap on `.github/` is intentional, not an oversight.** `AI_CONFIG.relatedAutomationPaths`/`relatedAutomationPrefixes` (`.github/workflows/pr_validation*.yml`, `.github/scripts/`) is a strict subset of `CI_SCRIPTS_CONFIG`'s `.github/` prefix, so a change to those specific files needs both `/ai-approved` and `/ci-approved`. Kept as defense-in-depth: if `ci-scripts-validation` is ever disabled or broken, `ai-config-validation`'s own narrower self-protection for the validation machinery still holds on its own.
- **Fine-grained tokens report `issues: write` OR `pull-requests: write` as sufficient for labels/comments -- live behavior on a PR target says otherwise.** Same gotcha as `/retest-e2e`'s bot token above: labels/comments on a PR need `pull-requests: write` specifically, not `issues: write` alone, even though the docs list either as acceptable. `pr_validation_commands.yml` routes `/ai-approved`/`/ci-approved`'s label/reaction calls through the `kubevirt-plugin-bot` app token (requesting both scopes) for the same fork-PR `GITHUB_TOKEN`-read-only reason documented above, but keeps commit-status calls (`setCommitStatus`, used by `ai-config-validation`, `ci-scripts-validation`, and `jira-validation` alike) **and** the `.github/OWNERS` lookup itself (`repos.getContent`, needs `contents: read`) on the ambient `GITHUB_TOKEN` via a second, ambient-scoped Octokit client (`GitHubConfig.statusToken`, `createStatusOctokit` in `github-repo.ts`) -- the bot app has neither `statuses` nor `contents` permission and won't be granted either, and both scopes already work fine on a fork PR via the ambient token. Missing this split for the OWNERS lookup specifically would silently reject every legitimate `/ai-approved`/`/ci-approved` (the bot token's 403 on `getContent` is caught and treated as "untrusted", not surfaced as an error) -- caught in this session's own security review before it shipped.
- **Adding a check to `required_status_checks` makes every already-open PR show it as "Expected" until its next event.** GitHub doesn't retroactively backfill a status for existing head SHAs -- any PR open before this change won't show `ai-config-validation` as passing until its next push or comment naturally re-triggers `pr_validation.yml`. Time this kind of change for a quiet period, or be ready to explain the transient "Expected -- waiting for status to be reported" row.
- **`pr_validation_commands.yml` uses `cancel-in-progress: false` on `pr-validation-cmd-<PR#>`.** Rapid successive comments (`/lgtm` then `/approve`, or `/ai-approved` then `/ci-approved`) queue rather than cancel mid-flight -- important now that `/lgtm`/`/approve`/`/hold` share that workflow with the older validation commands.
- **Known limitation: `isListedInOwners`'s approvers-only matching isn't full Prow OWNERS semantics.** No aliases, no nested/parent OWNERS resolution -- intentional, the same simplified model `check-trust`'s composite action already uses elsewhere in this repo for `/retest-e2e`/`/cancel-e2e`/`/hold-e2e`.

## Script Configuration

All scripts accept configuration via environment variables. See the header comments in each script for details.

Key defaults:

- `KVM_EMULATION=false` (bare metal has real KVM; set `true` for VPC/shared)
- `RUNNER_SCALE_SET_NAME=kubevirt-plugin-ci` (the `runs-on:` label)
- `ARC_CONTROLLER_INSTALL_NAME=arc` (Helm release for controller)
- `ARC_VERSION=0.14.0` (pinned Helm chart version)
- `MAX_RUNNERS=2` (max concurrent ARC runner pods per cluster -- caps concurrent E2E + manual-console jobs against that cluster; extra jobs queue for a free runner rather than overloading it. Independent per cluster, since each has its own scale set. Override via `ibmc-cluster-setup.yml`'s `max_runners` input, or re-provision to apply a changed default)

## Cost Control

The auto-teardown workflow provides automatic cost control:

- Runs every 30 minutes via cron
- Checks if any E2E jobs are in-progress or queued
- If idle for more than 2 hours, triggers the teardown workflow
- Worst case: an idle cluster runs ~2.5 hours before teardown

Always verify the cluster has been torn down when done testing. The auto-teardown is a safety net, not a substitute for manual cleanup.

## Known Limitations

- **`ttl.sh` for plugin images**: Plugin images use ephemeral `ttl.sh` tags with 2h TTL per CI run. Suitable for CI but not for long-term storage.
- **Ghost runner cleanup**: Requires the ARC GitHub App credentials (`ARC_GITHUB_APP_ID` + `ARC_GITHUB_APP_PRIVATE_KEY`). If ARC auth is instead configured via `ARC_GITHUB_PAT`, offline runners must be cleaned up manually.
- **IBM Cloud VPC hairpin NAT**: VPC load balancers don't support hairpin NAT. On IPI clusters, ingress canary checks fail and the authentication operator may report Degraded. This is cosmetic -- the console works fine for browser access from outside the cluster, and CI tests are unaffected (they use internal service URLs).

## Troubleshooting

### Cluster setup fails

- Check IBM Cloud status page for outages
- Verify the API key has sufficient permissions (expand the **IAM diagnostics** step log or download the artifact)
- For classic: check `ibmcloud ks infra-permissions get --region <region>`
- For VPC/IPI: check VPC Infrastructure permissions

### ARC runners not registering

- Check ARC controller logs: `oc logs -n arc-systems -l app.kubernetes.io/name=gha-rs-controller`
- Verify GitHub App credentials are correct
- Ensure the GitHub App is installed on the repository

### Health check fails

- Run `ci-scripts/hot-cluster/check-cluster-health.sh` manually with `oc` configured
- Check individual component status: `oc get pods -n openshift-cnv`
- Verify storage: `oc get storageclass`

### Auto-teardown not triggering

- The scheduled job needs `permissions: actions: write` to dispatch teardown
- `workflow_id` in the dispatch step must match the teardown workflow filename on the default branch
- For IPI clusters: auto-teardown detects them via DNS probe (`api.<cluster>.cnv-ui.com`)

### `npm ci` fails on ARC runner

- Run `npm install` locally and commit the updated `package-lock.json`
- Check Node/npm version compatibility (runner image provides Node 22)
- Verify the runner can reach `registry.npmjs.org`
