# GitHub Actions Runner Controller (ARC) on OpenShift

Scripts in this directory install **Actions Runner Controller** with the **`gha-runner-scale-set`** chart on **OpenShift** (ROKS or other OCP clusters). They apply a custom **SecurityContextConstraints** (`github-arc`), bind it to the runner ServiceAccount, and apply **ClusterRole** RBAC so jobs can use `oc` / KubeVirt APIs. The custom runner image is built in-cluster by [`../images/setup-arc-runner-image.sh`](../images/setup-arc-runner-image.sh) — see that script's header comments for its environment variables.

All scripts expect **`oc login`** to an OpenShift cluster with permissions to create namespaces, SCC-related `ClusterRole`s, and Helm releases.

## Order of operations

Run from the **repository root** (paths below assume that).

1. **`../images/setup-arc-runner-image.sh`** — OpenShift `ImageStream`/`BuildConfig` binary build from [`../images/arc-runner/Dockerfile`](../images/arc-runner/Dockerfile) → custom runner image in the internal registry (namespace `arc-runners` by default). Prints **`IMAGE_REF=...`** for automation.
2. **`install-arc-controller.sh`** — Once per cluster: namespace `arc-systems`, apply **`arc-openshift-scc.yaml`**, Helm **`gha-runner-scale-set-controller`**.
3. **`install-runner-scale-set.sh`** — Per scale set: namespace `arc-runners`, Helm **`gha-runner-scale-set`** with GitHub auth, optional **`ARC_RUNNER_IMAGE`**, **`oc policy add-role-to-user system:openshift:scc:github-arc`** on the runner SA, apply **`arc-runner-rbac.yaml`** (unless `SKIP_ARC_RUNNER_RBAC=1`).

```bash
export ARC_CONFIG_URL="https://github.com/org/repo"
export ARC_APP_ID="..." ARC_APP_INSTALL_ID="..." ARC_APP_PRIVATE_KEY="$(cat app.pem)"
# optional: export ARC_RUNNER_IMAGE after setup-arc-runner-image.sh prints IMAGE_REF=

IMAGE_REF=$(./ci-scripts/hot-cluster/images/setup-arc-runner-image.sh | grep '^IMAGE_REF=' | cut -d= -f2-)
export ARC_RUNNER_IMAGE="${IMAGE_REF}"

./ci-scripts/hot-cluster/arc/install-arc-controller.sh
./ci-scripts/hot-cluster/arc/install-runner-scale-set.sh
```

## Environment variables (summary)

| Area                   | Variables                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Runner image build** | `NS`, `OC_VERSION`, `HELM_VERSION`, `VIRTCTL_VERSION`, `YQ_VERSION`, `ARC_RUNNER_IMAGE_FILE` (see [`../images/setup-arc-runner-image.sh`](../images/setup-arc-runner-image.sh))                                                                                                                              |
| **Controller**         | `ARC_CONTROLLER_NS`, `ARC_CONTROLLER_INSTALL_NAME`, `ARC_VERSION`                                                                                                                                                                                                                                            |
| **Scale set**          | `ARC_CONFIG_URL` (required), GitHub App (`ARC_APP_ID`, `ARC_APP_INSTALL_ID`, `ARC_APP_PRIVATE_KEY`) **or** `ARC_PAT`; `RUNNER_SCALE_SET_NAME`, `MIN_RUNNERS`, `MAX_RUNNERS`, `ARC_RUNNERS_NS`, `ARC_CONTROLLER_NS`, `ARC_CONTROLLER_INSTALL_NAME`, `ARC_VERSION`, `ARC_RUNNER_IMAGE`, `SKIP_ARC_RUNNER_RBAC` |

Details are in each script’s header comments.

## GitHub configuration

- **GitHub App** (recommended): repository **Administration: Read and write**, organization **Self-hosted runners: Read and write**. Install the app on the target repo/org; use App ID, installation ID, and private key PEM.
- **PAT**: fine-grained or classic with sufficient repo + runner permissions (see [ci-scripts/README.md](../../README.md) Required GitHub Secrets).

Workflows must use `runs-on:` labels that match **`RUNNER_SCALE_SET_NAME`** (default **`kubevirt-plugin-ci`**).

## Second runner scale set

Do **not** re-run **`install-arc-controller.sh`**. Set `ARC_RUNNERS_NS`, `RUNNER_SCALE_SET_NAME`, and `ARC_CONFIG_URL` (and auth) for the new set. Use **`SKIP_ARC_RUNNER_RBAC=1`** so the default **`arc-runner-ci`** `ClusterRoleBinding` (single subject) is not overwritten; then bind **`arc-runner-ci`** to the new runner SA:

`oc adm policy add-cluster-role-to-user arc-runner-ci -z <RUNNER_SCALE_SET_NAME>-gha-rs-no-permission -n <ARC_RUNNERS_NS>`

You do **not** need to re-apply **`arc-openshift-scc.yaml`**.

## Ops: Execute tests stuck `queued` with no runner

[`ibmc-cluster-setup.yml`](../../../.github/workflows/ibmc-cluster-setup.yml) skips reinstalling ARC on an already-running cluster whenever its own **Check ARC listener health** step reports the listener pod Ready in `arc-systems`. That check is Kubernetes-only: it cannot see whether GitHub actually has that listener registered and assigning jobs. If the listener pod looks Ready but **`Execute tests` stays `queued` with no runner ever claiming it**, the registration itself is likely stale or broken, and the skip above is hiding it.

**From a PR:** comment **`/force-arc-reinstall`**. It dispatches `hot-cluster-e2e.yml` with `force_arc_reinstall: true` for that PR, which also cancels and supersedes any already-queued/in-progress run for it — no separate `/retest-e2e` follow-up needed. Stuck `queued` jobs are often **not re-offered** by GitHub once ARC recovers, so re-dispatching (rather than waiting on the original queued job) is required, and this command does both in one step. Gated the same as `/retest-e2e` (OWNERS approvers/reviewers only), since it reinstalls ARC on the **shared** cluster for that branch's pool and can transiently disrupt other PRs' queued jobs on it.

**Outside a PR** (e.g. periodic/standalone cluster upkeep), dispatch either workflow manually instead:

- **Hot Cluster E2E** (`hot-cluster-e2e.yml`) with `force_arc_reinstall: true`, or
- **IBM Cloud Hot Cluster Setup** (`ibmc-cluster-setup.yml`) directly with `force_arc_reinstall: true` on the affected `cluster_name`.

Either way, this re-runs `install-arc-controller.sh` + `install-runner-scale-set.sh` (helm upgrade) regardless of the listener check result. If you dispatch manually and a job is already stuck `queued`, remember to **cancel** the affected run(s) and re-dispatch (e.g. `/retest-e2e`) rather than waiting for the original queued job to pick up.

`force_arc_reinstall` has **no effect** on an already-existing `infrastructure_type: ipi` cluster: unlike ROKS (vpc/classic), IPI has no way to reconnect to an existing cluster from a fresh job run (its kubeconfig only ever lives in that job's ephemeral `runner.temp`), so forcing the job to re-enter would re-trigger cluster creation/destruction instead of safely reaching the ARC-reinstall steps -- this is deliberately a no-op there rather than something destructive. `kubevirt-plugin-ci` (the shared gating cluster) uses `vpc`, so this does not affect normal PR gating.

## Files in this directory

| File                            | Purpose                                                                   |
| ------------------------------- | ------------------------------------------------------------------------- |
| `arc-openshift-scc.yaml`        | SCC `github-arc` + `ClusterRole` to use it                                |
| `arc-runner-rbac.yaml`          | `arc-runner-ci` ClusterRole + Binding (subject patched by install script) |
| `arc-runner-scale-set.pod.yaml` | Helm values fragment for the runner container (volumes, securityContext)  |
| `arc-helm-helpers.sh`           | Shared Helm/auth helpers                                                  |

The custom runner image and its `Dockerfile` live in [`../images/`](../images/) (built by `../images/setup-arc-runner-image.sh`), not in this directory.

## Further reading

- [ci-scripts/README.md](../../README.md) — secrets, E2E check-run model, Prow→GHA migration.
- [Red Hat: ARC on OpenShift](https://developers.redhat.com/articles/2025/02/17/how-securely-deploy-github-arc-openshift)
- Upstream chart: `oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set`
