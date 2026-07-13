# Hot Cluster CI

This directory contains scripts and documentation for the **IBM Cloud hot cluster** CI stack: an OpenShift cluster used for KubeVirt plugin E2E testing, with **Hyperconverged Cluster Operator (HCO)** and **GitHub Actions Runner Controller (ARC)** for self-hosted runners (`kubevirt-plugin-ci`).

Three infrastructure types are supported: **Classic ROKS**, **VPC ROKS** (recommended), and **IPI** (self-managed OpenShift).

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
hot-cluster-e2e.yml     → "Hot Cluster E2E" (PR trigger + manual dispatch)
  ├── prepare (resolve cluster config, trust, PR context, initial progress status)
  ├── cluster-check (workflow_call → hot-cluster-check.yml; its `result` job
  │     also runs the manual health check, manual dispatch only)
  ├── progress-check-running-tests (advance progress status once cluster is ready)
  ├── run-e2e-tests (workflow_call → hot-cluster-e2e-run.yml)
  └── verify-gating-tests (publishes the required "Run Gating Tests" check)

hot-cluster-e2e-run.yml → "Hot Cluster E2E Run"
  ├── build-kubevirt-plugin-image (podman build + push to ttl.sh)
  └── run-gating-tests (runs-on: kubevirt-plugin-ci) -- displays as "Execute tests"
        ├── ARC runner diagnostics (folded in, formerly a separate check-runner job)
        ├── ci-env-request → ci-env-controller → ci-test-stack
        ├── BRIDGE_BASE_ADDRESS from test stack
        └── Playwright gating (or features project)
```

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

The hot-cluster pipeline manages its own required check ("Run Gating Tests") and an informational "Hot Cluster E2E Progress" status across several workflows (`hot-cluster-e2e.yml`, `retest-e2e.yml`, `cancel-e2e.yml`, `retest-stale-gating.yml`, `retest-on-pool-entry.yml`) and the `publish-gating-check` action. A few GitHub behaviors drive the design:

- **`pull_request_target` reads the workflow file from the base branch, not the PR.** GitHub Actions does this deliberately (a PR can't rewrite the workflow to steal secrets), which means a PR that changes `hot-cluster-e2e.yml` itself won't exercise its own new logic via a normal `pull_request_target` run until it's merged. Validate pipeline changes with a `workflow_dispatch` run against the PR's branch instead (`workflow_dispatch` reads the workflow file from whatever ref you dispatch to).
- **Required checks must be published explicitly, not left to a job's own native check-run.** A job's native check-run is tied to its position/name within a specific workflow run; if a _later_ run of the _same workflow_ doesn't happen to include a job with that exact name (e.g. a differently-shaped no-op run), GitHub's rollup can stop showing an earlier successful result as "current" for that name, leaving branch protection stuck on "Expected -- waiting for status". `verify-gating-tests` therefore never relies on its own native check-run for "Run Gating Tests" -- it always publishes that check explicitly via `publish-gating-check` (`checks.create()`), for every real trigger path (a normal PR event, or a `pr_number` retest). `verify-gating-tests`'s own display name is deliberately never the literal "Run Gating Tests" string, so it can't collide with the explicitly-published one.
- **Most-recent-wins for explicitly-published checks**: unlike native per-job check-runs, checks created via `checks.create()` reliably persist and get shown "most recent wins" by name, regardless of what any given run's job names are. A check-run's status can never be updated after creation by a different workflow run, so "retrying" always means creating a fresh check-run, never patching the old one. `retest-stale-gating.yml`'s stale-marking and the "supersede stale check" step in `prepare` both rely on this.
- **Bot-label no-ops stay silent, not differently-named.** Labels like `lgtm`/`approved`/`jira/valid-reference` re-trigger `hot-cluster-e2e.yml` without representing a real code change. Rather than posting a distinctly-named "skipped" entry for every such event (which used to add permanent extra rows to nearly every PR), these runs post nothing at all for "Hot Cluster E2E Progress" (a plain commit status safely keeps its last real state) and skip `verify-gating-tests` entirely via `if:` (so it collapses into the merge box's unobtrusive "N skipped" bucket instead of showing as a confusing distinctly-named "successful" check). The run is still identifiable via a `(skipped: irrelevant label)` marker appended to `run-name:` (queryable as each run's `display_title`), which `/retest-e2e` uses to skip past no-op runs when picking which run to re-run.
- **Stale-after-main-advances**: `retest-stale-gating.yml` marks every open PR's check `neutral`/stale on every push to `main` (Tide's old re-test-before-merge guarantee, which the hot cluster doesn't get natively), then dispatches a real retest for merge-pool PRs only, using `hot-cluster-e2e.yml`'s `pr_number` input to test the PR merged with the new `main` tip. This applies to any open, non-pool PR shortly after its own gating tests pass, since `main` advances constantly -- it's expected, not a sign the pipeline is broken.
- **Pool-entry is a second, narrower trigger for the same staleness problem.** `retest-stale-gating.yml` only re-evaluates merge-pool membership on a push to `main` -- a PR that gains `lgtm`+`approved` (or loses `hold`) afterward, while its check is still that push's stale marker, gets no further trigger until `main` next advances or someone manually intervenes. `retest-on-pool-entry.yml` closes that specific gap: on `labeled`/`unlabeled` events for the relevant label names, it checks fresh pool eligibility and whether the current check is still the stale marker, and only then dispatches a real retest -- kept deliberately narrow (not "every open PR, every label change") for the same cluster-cost reasons as the two-tier split above. Any race between the two workflows' dispatches for the same PR is already handled safely by `cluster-check`/`run-e2e-tests`'s own job-level concurrency groups.
- **`/retest-e2e` must be able to find a `pr_number` dispatch's own run.** A `pr_number` retest (this fallback, or `retest-stale-gating.yml`'s merge-pool retest) always runs against `ref: main`, so it carries no PR association, and its head SHA/branch are `main`'s, not the PR's -- none of the normal PR/SHA/branch match signals apply. `/retest-e2e` matches these via the `PR#<number> retest` token in `run-name:` instead, and doesn't filter its search to `pull_request_target` events, so a previous retest dispatch is re-run rather than silently re-dispatched from scratch every time.
- **`/cancel-e2e` cancels by entering the same job-level concurrency groups, not by calling the cancel API.** `cancel-e2e.yml` doesn't call `cancelWorkflowRun()` -- that only cancels a superseded run's own bookkeeping, the same limitation described above. Its `cancel-cluster-check` and `cancel-run-e2e-tests` jobs instead just enter `hot-cluster-check-<PR#>` / `hot-cluster-run-e2e-<PR#>` directly (identical group keys, no dispatch indirection needed since concurrency groups are keyed by a plain string across the whole repository) and immediately no-op, which is what actually terminates whatever currently holds those groups. It never touches "Run Gating Tests" -- only the informational progress status -- since a cancellation isn't a test result.
- **Real cancellation has to live at the job level, not the workflow level.** `hot-cluster-e2e.yml` deliberately has no workflow-level `concurrency:` block. A workflow-level group with `cancel-in-progress: true` holds an _entire new run_ at pending (zero jobs, not even `Prepare`) until the older run in the same group reaches a terminal state -- and a `uses:` job (a job that calls a reusable workflow, like `cluster-check` or `run-e2e-tests`) never actually gets killed by that cancellation, so the older run's self-hosted E2E job keeps running to completion untouched and the group never frees. The new run would then never start at all, let alone cancel anything. Instead, `cluster-check` and `run-e2e-tests` each carry their own job-level `concurrency:` group (PR-scoped, own suffix so they don't cancel each other): cheap jobs (`Prepare`, progress/verify) run immediately on every trigger with no gating, and only the two jobs that cost real cluster time enforce "one at a time per PR" -- which GitHub does properly honor for job-level groups, including ones backed by a reusable workflow. Any brief overlap in the cheap jobs' postings is harmless given "most-recent-wins" above. `/retest-e2e` relies on the same job-level groups: if the run it matches for a PR is still in progress (not `completed`), it dispatches a fresh run instead of calling `reRunWorkflow` (which only works on a completed run) -- the fresh dispatch's `cluster-check`/`run-e2e-tests` jobs cancel the still-running ones via these groups rather than erroring out or racing them.

## Script Configuration

All scripts accept configuration via environment variables. See the header comments in each script for details.

Key defaults:

- `KVM_EMULATION=false` (bare metal has real KVM; set `true` for VPC/shared)
- `RUNNER_SCALE_SET_NAME=kubevirt-plugin-ci` (the `runs-on:` label)
- `ARC_CONTROLLER_INSTALL_NAME=arc` (Helm release for controller)
- `ARC_VERSION=0.14.0` (pinned Helm chart version)

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
