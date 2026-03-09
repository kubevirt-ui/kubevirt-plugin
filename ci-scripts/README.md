# Hot Cluster CI

This directory contains scripts and documentation for the **IBM Cloud hot cluster** CI stack: an OpenShift (ROKS) cluster used for KubeVirt plugin integration testing, with **Hyperconverged Cluster Operator (HCO)** and **GitHub Actions Runner Controller (ARC)** so jobs can run on cluster-adjacent self-hosted runners (`kubevirt-plugin-ci`).

Workers can be **bare metal** (real KVM) or **VPC / shared** flavors with **KVM emulation**; the setup workflow defaults favor VPC-style flavors and `kvm_emulation: true` unless you change inputs.

## Why this stack (motivation)

| Goal                                   | Approach                                                                                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real KubeVirt / OpenShift behavior** | Tests run against a live cluster with HCO, virt stack, and storage—not mocks.                                                                                                                      |
| **Console + plugin fidelity**          | Two POC paths: hit the **in-cluster** console URL, or run an **off-cluster** console container with the plugin served like the operator (TLS + nginx), matching how developers run bridge locally. |
| **Long-running / privileged CI**       | GitHub-hosted runners are a poor fit for nested virt, heavy Cypress, and Docker-heavy flows; **ARC** on the cluster provides dind-capable runners with `oc` RBAC.                                  |
| **Cost control**                       | Bare metal and large workers are expensive; **auto-teardown** after idle time limits runaway spend.                                                                                                |

## Architecture

**Lifecycle (IBM Cloud)**

```
GitHub Actions
  │
  ├── ibmc-cluster-setup.yml          → "IBM Cloud Hot Cluster Setup"
  ├── ibmc-cluster-teardown.yml       → "IBM Cloud Hot Cluster Teardown" (also workflow_call + ghost-runner cleanup)
  └── ibmc-cluster-auto-teardown.yml  → "IBM Cloud Hot Cluster Auto-Teardown" (cron + dispatch → teardown workflow)
```

**POC E2E (two variants)**

```
poc-e2e-ci-test.yml   — "POC Hot ClusterE2E CI Test"
  ├── cluster-health-check (ubuntu-latest + IBM Cloud → kubeconfig)
  │     └── ci-scripts/check-cluster-health.sh  (+ optional GitHub runner API check / skip for forks)
  └── run-gating-tests (runs-on: kubevirt-plugin-ci)
        ├── kubeconfig from IBM Cloud CLI
        ├── BRIDGE_BASE_ADDRESS = in-cluster console URL (from Cluster Console CR)
        └── Cypress: npm ci, test-setup.sh, test-cypress-headless

poc-e2e-ci-test2.yml  — "POC Hot Cluster E2E CI Test 2"
  ├── check-runner (optional diagnostics on ARC runner)
  ├── build-kubevirt-plugin-image (ubuntu-latest, Docker; may skip if image exists in registry)
  └── run-gating-tests (runs-on: kubevirt-plugin-ci)
        ├── ci-scripts/resolve-console-image.sh  → CONSOLE_IMAGE matches cluster OCP x.y
        ├── ci-scripts/start-plugin-container.sh → plugin over HTTPS :9001 (dind/docker)
        ├── ci-scripts/start-console.sh          → origin-console container, off-cluster mode
        ├── BRIDGE_BASE_ADDRESS=http://localhost:9000
        └── Cypress against local bridge + plugin proxy
```

Use **test** when you want the fastest path aligned with the cluster’s real console route. Use **test2** to validate the **local bridge + containerized plugin** pattern (closer to dev workflows and useful when debugging console/plugin versioning).

## Required GitHub Secrets

These secrets must be configured in the repository settings before running the workflows.

### IBM Cloud

| Secret              | Description           | How to Obtain                                                 |
| ------------------- | --------------------- | ------------------------------------------------------------- |
| `IBM_CLOUD_API_KEY` | IBM Cloud IAM API key | IBM Cloud Console → Manage → Access (IAM) → API keys → Create |

The API key must belong to a user or service ID with the following IAM permissions:

- **Kubernetes Service**: Administrator role (to create/delete ROKS clusters)
- **VPC Infrastructure Services**: Editor role (if using VPC-based clusters)
- **Classic Infrastructure**: Super User or equivalent (for bare metal provisioning)

### Ghost Runner Cleanup (optional)

| Secret    | Description               | How to Obtain                               |
| --------- | ------------------------- | ------------------------------------------- |
| `BOT_PAT` | PAT with repo admin scope | GitHub Settings → Developer Settings → PATs |

The `BOT_PAT` is only needed if you want the teardown workflow to automatically delete offline "ghost" runners from GitHub. Deleting self-hosted runners requires repository admin access which `GITHUB_TOKEN` cannot provide. The PAT needs the `repo` scope (classic) or **Administration: Read and Write** (fine-grained). If not set, ghost runners can be cleaned up manually via Settings → Actions → Runners.

### ARC Authentication (choose one)

#### Option A: GitHub App (recommended for production)

| Secret                       | Description           | How to Obtain                     |
| ---------------------------- | --------------------- | --------------------------------- |
| `ARC_GITHUB_APP_ID`          | GitHub App ID         | See "Creating a GitHub App" below |
| `ARC_GITHUB_APP_INSTALL_ID`  | App installation ID   | See "Creating a GitHub App" below |
| `ARC_GITHUB_APP_PRIVATE_KEY` | App private key (PEM) | See "Creating a GitHub App" below |

#### Option B: Personal Access Token (simpler, less secure)

| Secret           | Description      | How to Obtain                                              |
| ---------------- | ---------------- | ---------------------------------------------------------- |
| `ARC_GITHUB_PAT` | Fine-grained PAT | GitHub Settings → Developer Settings → Fine-grained tokens |

The PAT requires these permissions on the target repository:

- **Administration**: Read and Write
- **Metadata**: Read-only

## Cluster Authentication

All workflows that need cluster access use the IBM Cloud CLI to pull a kubeconfig on-demand:

```yaml
- name: Setup IBM Cloud CLI
  uses: IBM/actions-ibmcloud-cli@v1
  with:
    api_key: ${{ secrets.IBM_CLOUD_API_KEY }}
    plugins: kubernetes-service

- name: Configure kubeconfig
  run: |
    ibmcloud oc cluster config --cluster "${CLUSTER_NAME}" --admin
    oc cluster-info
```

This avoids storing kubeconfig or credentials as GitHub secrets. Any workflow or job that needs `oc`/`kubectl` access simply repeats these two steps with the shared `IBM_CLOUD_API_KEY`.

## Creating a GitHub App for ARC

1. Go to your organization settings (or personal settings) → Developer settings → GitHub Apps → New GitHub App
2. Configure the app:
   - **Name**: `kubevirt-plugin-arc` (or any name)
   - **Homepage URL**: Your repository URL
   - **Webhook**: Uncheck "Active" (not needed)
   - **Permissions**:
     - Repository permissions → Administration: Read and Write
     - Organization permissions → Self-hosted runners: Read and Write
3. Create the app and note the **App ID**
4. Generate a **Private Key** (downloads a `.pem` file)
5. Install the app on your organization/repository and note the **Installation ID**
   - Find it in the URL: `https://github.com/settings/installations/<INSTALL_ID>`
6. Store the three values as GitHub secrets:
   - `ARC_GITHUB_APP_ID` = App ID
   - `ARC_GITHUB_APP_INSTALL_ID` = Installation ID
   - `ARC_GITHUB_APP_PRIVATE_KEY` = Contents of the `.pem` file

## Usage

### ARC install scripts (OpenShift)

All ARC automation lives under **`ci-scripts/arc/`**. See **[`ci-scripts/arc/README.md`](arc/README.md)** for the full walkthrough.

| Script                                           | Role                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ci-scripts/arc/setup-dind-mirror.sh`**        | Mirror **`docker:dind`** to the internal registry, write **`ci-scripts/generated/arc-dind-replace.env`** for Helm post-rendering (standard path; `SKIP_DIND_MIRROR=1` only if dind is provided another way).                                                                                                                                                                      |
| **`ci-scripts/arc/setup-runner-image.sh`**       | Build custom runner image (BuildConfig + `runner-image/Dockerfile`); prints **`IMAGE_REF=`**.                                                                                                                                                                                                                                                                                     |
| **`ci-scripts/arc/install-arc-controller.sh`**   | Once per cluster: `arc-systems`, **`ci-scripts/arc/arc-openshift-scc.yaml`**, Helm **`gha-runner-scale-set-controller`**.                                                                                                                                                                                                                                                         |
| **`ci-scripts/arc/install-runner-scale-set.sh`** | Per scale set: Helm **`gha-runner-scale-set`**, optional **`ARC_RUNNER_IMAGE`**, dind post-render (**`--storage-driver=vfs`** always; optional **`docker:dind`** mirror via env file or **`ARC_DIND_INTERNAL_IMAGE`**), SCC bind, **`arc-runner-rbac.yaml`** (unless `SKIP_ARC_RUNNER_RBAC=1`). Requires **`ARC_CONFIG_URL`** + GitHub auth. Run **after** the controller script. |

Hot Cluster Setup runs **`ci-scripts/arc/setup-dind-mirror.sh`**, **`ci-scripts/arc/setup-runner-image.sh`**, then **`ci-scripts/arc/install-arc-controller.sh`** and **`ci-scripts/arc/install-runner-scale-set.sh`** (same env for the install steps).

### Custom runner image

The setup workflow builds a **custom runner image** on the cluster. The image extends the official GitHub Actions runner with Node.js 22, kubectl, oc, virtctl, and jq. Container workflows use **Docker** via the ARC **dind** sidecar (`DOCKER_HOST`).

- **Dockerfile**: `ci-scripts/arc/runner-image/Dockerfile`
- **Runner pod Helm fragment**: `ci-scripts/arc/arc-runner-scale-set.pod.yaml` — used by **`ci-scripts/arc/install-runner-scale-set.sh`**.
- **Dind post-render**: **`ci-scripts/arc/install-runner-scale-set.sh`** always runs Helm with **`--post-renderer ci-scripts/arc/arc-dind-post-render.sh`** for **`CONTAINER_MODE=dind`** (injects **`--storage-driver=vfs`** so nested overlay does not fail on OpenShift). **`ci-scripts/arc/setup-dind-mirror.sh`** writes **`ci-scripts/generated/arc-dind-replace.env`** so the post-renderer also swaps **`docker:dind`** for the internal registry; you can set **`ARC_DIND_INTERNAL_IMAGE`** at install time instead (writes the same env file for that run).
- **Refresh runner image only**: re-run **`ci-scripts/arc/setup-runner-image.sh`**, then **`ci-scripts/arc/install-runner-scale-set.sh`** with **`ARC_RUNNER_IMAGE`** set to the new ref (and the same auth env vars).

Optional: `OC_VERSION`, `VIRTCTL_VERSION`, `ARC_RUNNERS_NS`, `CONTAINER_MODE` (default **dind**), `ARC_VERSION`, `ARC_SCALE_SET_LABELS`, `SKIP_ARC_RUNNER_RBAC=1`.

#### ARC 0.14.0+ ([changelog](https://github.blog/changelog/2026-03-19-actions-runner-controller-release-0-14-0/))

**`ci-scripts/arc/install-arc-controller.sh`** and **`ci-scripts/arc/install-runner-scale-set.sh`** use Helm chart **`0.14.0`** by default so controller and scale-set versions stay aligned and reproducible.

| Feature                               | How we use it                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multilabel scale sets**             | Optional env **`ARC_SCALE_SET_LABELS=kubevirt-plugin-ci,linux`** (comma-separated). Jobs must target **every** label, e.g. `runs-on: [kubevirt-plugin-ci, linux]`. Omit the variable to keep the previous single-label behavior (default `runs-on: kubevirt-plugin-ci`).                                                                                 |
| **Listener on Linux nodes**           | Upstream defaults the listener pod to **`kubernetes.io/os: linux`** — helpful on mixed OS clusters without extra config.                                                                                                                                                                                                                                 |
| **`resourceMeta` labels/annotations** | Optional: merge **`ci-scripts/examples/arc-0.14-extra-values.yaml`** (commented patterns) via **`ARC_RUNNER_EXTRA_VALUES`**.                                                                                                                                                                                                                             |
| **Experimental charts**               | **`gha-runner-scale-set-experimental`** exposes **`runner.dind.container.image`**, so you could point dind at your internal mirror **without** the Helm post-renderer — values shape differs (`scaleset`, `auth`, …); treat as a larger migration. OCI path: `oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set-experimental`. |

The **stable** chart still hardcodes **`docker:dind`** in templates; this repo keeps **`ci-scripts/arc/setup-dind-mirror.sh`** + **`ci-scripts/arc/arc-dind-post-render.sh`** unless you adopt the experimental chart or cluster mirroring.

#### Dind image source

The stable chart embeds **`docker:dind`** (Docker Hub). This repo **always mirrors** that image into the OpenShift internal registry via **`ci-scripts/arc/setup-dind-mirror.sh`** and rewrites rendered manifests with the Helm post-renderer so runner pods pull **arc-docker-dind** from the cluster registry.

If **`oc import-image`** fails (rate limits or blocked egress to docker.io), add a **cluster-level** pull credential for docker.io or adjust **`DIND_SOURCE_IMAGE`** / mirroring—not GitHub Actions Docker Hub secrets. Use **`SKIP_DIND_MIRROR=1`** only when dind is satisfied by **`ImageContentSourcePolicy`** or another mirror.

### Docker-in-Docker (default)

**`ci-scripts/arc/install-runner-scale-set.sh`** defaults **`CONTAINER_MODE=dind`**. The ARC chart adds a privileged **`docker:dind`** sidecar and wires the main runner container with `DOCKER_HOST=unix:///var/run/docker.sock` so workflows can run:

- `docker build` / `docker run` in steps
- `container:` jobs and container actions that need a Docker daemon

The custom runner image is still the **main** `runner` container; the chart merges your `template.spec.containers[runner]` with dind-specific env and volume mounts (see upstream `gha-runner-scale-set` `_helpers.tpl`).

**OpenShift:** the `github-arc` SCC in `ci-scripts/arc/arc-openshift-scc.yaml` allows **privileged** containers and **RunAsAny** for UIDs so the `docker:dind` sidecar can run as root while the runner container stays at 1001/123 via Helm. This is broader than a “restricted-only” SCC; scope runner namespaces and RBAC accordingly.

To turn off dind (no Docker daemon in the pod): `export CONTAINER_MODE=none` and re-run **`ci-scripts/arc/install-runner-scale-set.sh`**.

### Workflow file ↔ Actions UI name

| File                                               | `name:` in workflow (shown in Actions tab) |
| -------------------------------------------------- | ------------------------------------------ |
| `.github/workflows/ibmc-cluster-setup.yml`         | IBM Cloud Hot Cluster Setup                |
| `.github/workflows/ibmc-cluster-teardown.yml`      | IBM Cloud Hot Cluster Teardown             |
| `.github/workflows/ibmc-cluster-auto-teardown.yml` | IBM Cloud Hot Cluster Auto-Teardown        |
| `.github/workflows/poc-e2e-ci-test.yml`            | POC Hot ClusterE2E CI Test                 |
| `.github/workflows/poc-e2e-ci-test2.yml`           | POC Hot Cluster E2E CI Test 2              |

### Setting up the hot cluster

1. Actions → **IBM Cloud Hot Cluster Setup** → Run workflow
2. Inputs: cluster name, **classic** zone (e.g. `wdc04`), OpenShift version, worker flavor/count, **KVM emulation** (`true` for VPC-style workers, `false` for bare metal with hardware KVM)
3. Wait for completion (provisioning time depends on flavor; setup includes HCO, dind mirror, custom runner image build, ARC controller + scale set, `check-cluster-health.sh`)

**Implementation notes:** Provisioning uses `ibmcloud oc cluster create classic` (not VPC workers in this workflow). Setup installs `oc` from the cluster downloads endpoint, runs `install-hco.sh`, then `arc/setup-dind-mirror.sh`, `arc/setup-runner-image.sh`, `install-arc-controller.sh`, and `install-runner-scale-set.sh`.

### Running POC E2E tests

**Variant A — `poc-e2e-ci-test.yml` (in-cluster console)**

1. Actions → **POC Hot ClusterE2E CI Test**
2. Inputs: Cypress spec (default `tests/gating.cy.ts`), cluster name, optional **skip ARC runner check** (forks without ARC)
3. Health job passes `GITHUB_TOKEN` into `check-cluster-health.sh` when GitHub API checks are needed; test job uses `test-setup.sh`, then `npm run test-cypress-headless`

**Variant B — `poc-e2e-ci-test2.yml` (off-cluster console + plugin containers)**

1. Actions → **POC Hot Cluster E2E CI Test 2**
2. Default spec: `tests/poc-gating.cy.ts` (narrower gating bundle than full `gating.cy.ts`)
3. Build job pushes/pulls a **plugin image** from a registry (see **POC debt** below).
4. The test job creates only the **test namespace + dummy secret** (not full `test-setup.sh`); modal handling and other prep lean on Cypress `beforeSpec` / shared helpers.
5. Test job starts **plugin** then **console** via `ci-scripts/`, then Cypress with `BRIDGE_BASE_ADDRESS=http://localhost:9000`

### Tearing down the cluster

**Manual:** Actions → **IBM Cloud Hot Cluster Teardown**

**Automatic:** **IBM Cloud Hot Cluster Auto-Teardown** runs on a schedule (`*/30 * * * *`), uses `GITHUB_TOKEN` with `actions: write` to dispatch **IBM Cloud Hot Cluster Teardown** when idle thresholds are met. Idle detection excludes setup/teardown/auto-teardown workflow names and compares against recent completed runs (fallback: cluster creation time).

**Teardown implementation:** Uninstalls Helm releases `kubevirt-plugin-ci` (scale set) and `arc` (controller) when possible, deletes the ROKS cluster, then optionally removes offline GitHub runners labeled `kubevirt-plugin-ci` using `BOT_PAT`.

## ARC on OpenShift vs [na-launch/github-arc](https://github.com/na-launch/github-arc/blob/main/README.md)

The [na-launch/github-arc](https://github.com/na-launch/github-arc/blob/main/README.md) README is a concise Helm + OpenShift recipe: fixed env vars for namespaces and installation names, explicit `serviceAccount.name=<install>-gha-rs-controller` on the controller chart, matching `controllerServiceAccount` on the scale set, apply SCC + ClusterRole, then `oc policy add-role-to-user system:openshift:scc:github-arc -z <runner-install>-gha-rs-no-permission`.

| Topic                   | na-launch/github-arc                                               | This repo (`ci-scripts/arc/*`)                                                                                  |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Controller SA name      | `${GITHUB_ARC_SYSTEM_INSTALLATION_NAME}-gha-rs-controller`         | `${ARC_CONTROLLER_INSTALL_NAME}-gha-rs-controller` (default install name `arc`)                                 |
| Scale set → controller  | `controllerServiceAccount.name` + `.namespace`                     | Same when OpenShift is detected                                                                                 |
| SCC + `use` ClusterRole | Separate `manifests/scc.yaml` + `cluster-role.yaml`                | Single `ci-scripts/arc/arc-openshift-scc.yaml` (equivalent)                                                     |
| Runner policy           | `oc policy add-role-to-user ... -z <install>-gha-rs-no-permission` | Same pattern                                                                                                    |
| Auth                    | PAT in `--set`                                                     | **GitHub App** (recommended) or PAT; App IDs forced to strings to avoid Helm float bugs                         |
| Runner pod template     | Checked-in `values.yaml`                                           | `ci-scripts/arc/arc-runner-scale-set.pod.yaml` + optional `ARC_RUNNER_EXTRA_VALUES`                             |
| Container jobs          | Not emphasized                                                     | **Default `CONTAINER_MODE=dind`** (privileged `docker:dind`); SCC allows privileged / RunAsAny for that sidecar |

**Additional runner scale sets (same as na-launch):** Keep `ARC_CONTROLLER_NS` and `ARC_CONTROLLER_INSTALL_NAME` unchanged. **Do not** re-run **`ci-scripts/arc/install-arc-controller.sh`**. Set `ARC_RUNNERS_NS`, `RUNNER_SCALE_SET_NAME`, and `ARC_CONFIG_URL` (and auth). Run **`SKIP_ARC_RUNNER_RBAC=1` `./ci-scripts/arc/install-runner-scale-set.sh`** so the shared `ClusterRoleBinding` **arc-runner-ci** is not overwritten (it only lists one ServiceAccount). The scale-set script still binds SCC **github-arc** to the new runner SA; add **ClusterRole** access for CI:

`oc adm policy add-cluster-role-to-user arc-runner-ci -z <new-RUNNER_SCALE_SET_NAME>-gha-rs-no-permission -n <new-ARC_RUNNERS_NS>`

You do **not** need to re-apply `ci-scripts/arc/arc-openshift-scc.yaml`.

## Scripts

| Script                            | Purpose                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `install-hco.sh`                  | Installs HCO operator, HPP storage, and virtctl                                   |
| `arc/setup-dind-mirror.sh`        | Mirror `docker:dind` to internal registry; write `generated/arc-dind-replace.env` |
| `arc/setup-runner-image.sh`       | OpenShift binary build for custom ARC runner image                                |
| `arc/install-arc-controller.sh`   | SCC + Helm `gha-runner-scale-set-controller` (once per cluster)                   |
| `arc/install-runner-scale-set.sh` | Helm `gha-runner-scale-set`, SCC bind, `arc-runner-rbac.yaml`                     |
| `arc/README.md`                   | ARC on OpenShift setup guide                                                      |
| `check-cluster-health.sh`         | Verifies cluster, HCO, ARC, storage, console; optional GitHub runner check        |
| `check-roks-cluster-state.sh`     | Waits until ROKS cluster is usable (used by setup workflow)                       |
| `resolve-console-image.sh`        | Emits `CONSOLE_IMAGE` tag **x.y** from `ClusterVersion` for off-cluster console   |
| `start-plugin-container.sh`       | Runs plugin image with TLS + `nginx-9443.conf` (Docker dind–safe cert paths)      |
| `start-console.sh`                | Runs `origin-console` off-cluster; `BRIDGE_PLUGIN_PROXY` + kubevirt API route     |
| `nginx-9443.conf`                 | Nginx config for plugin HTTPS (mounted into plugin container in POC test2)        |

### CI tools (helm, kubectl, oc, virtctl)

Scripts that need **helm**, **kubectl**, **oc**, or **virtctl** can source `ci-scripts/ci-tools.sh` and call the appropriate `ensure_*` function. Downloads are installed into `CI_TOOLS_DIR` (default: `ci-scripts/_ci_tools`) and added to `PATH`.

**Environment variables** (all optional; used when tools are downloaded):

| Variable          | Default                      | Description                    |
| ----------------- | ---------------------------- | ------------------------------ |
| `CI_TOOLS_DIR`    | `_ci_tools` under script dir | Install directory for binaries |
| `HELM_VERSION`    | v3.16.3                      | Helm version                   |
| `KUBECTL_VERSION` | stable                       | kubectl version or "stable"    |
| `OC_VERSION`      | 4.20                         | OpenShift client version       |
| `VIRTCTL_VERSION` | v1.4.0                       | virtctl version                |
| `CI_ARCH`         | amd64                        | Binary architecture            |

**Functions:** `ensure_helm`, `ensure_kubectl`, `ensure_oc`, `ensure_virtctl`, `ensure_all_ci_tools`. Optional first argument overrides the corresponding env var (e.g. `ensure_helm v3.12.0`).

### Script Configuration

All scripts accept configuration via environment variables. See the header comments in each script for details.

Key defaults:

- `KVM_EMULATION=false` (bare metal has real KVM)
- `RUNNER_SCALE_SET_NAME=kubevirt-plugin-ci` (the `runs-on:` label)
- `ARC_CONTROLLER_INSTALL_NAME=arc` (Helm release for controller; OpenShift SA `arc-gha-rs-controller`)
- `MIN_RUNNERS=0`
- `MAX_RUNNERS=5`
- `CONTAINER_MODE=dind` (Docker-in-Docker for container jobs / `docker` in workflows)
- `ARC_VERSION=0.14.0` (default pinned chart; `ARC_VERSION=latest` floats OCI default tag)
- `ARC_SCALE_SET_LABELS` (optional multilabel; requires matching `runs-on` array in workflows)
- Additional scale sets: run only **`ci-scripts/arc/install-runner-scale-set.sh`** (skip **`ci-scripts/arc/install-arc-controller.sh`**)

## POC: immediate next steps (toward stable green runs)

1. **Plugin image supply chain (`poc-e2e-ci-test2.yml`)** — Replace the hard-coded `KUBEVIRT_PLUGIN_IMAGE` (currently a fixed `ttl.sh/...` tag) with a per-run or per-SHA tag (e.g. uncomment the `github.run_id`-style pattern), or build on every run and push to a registry your cluster/runner can pull. Ensure the **skopeo inspect** skip path does not mask a broken or stale image.
2. **Align Cypress coverage with stability** — `tests/poc-gating.cy.ts` is intentionally smaller than full `tests/gating.cy.ts`; expand only after the off-cluster stack is reliable. Fix flaky specs (VM start/status waits, tab navigation) using the same patterns as local CI.
3. **Run variant A first for signal** — Use `poc-e2e-ci-test.yml` against a healthy cluster to separate **cluster/HCO** issues from **docker/console/plugin** issues in test2.
4. **Fork / ARC** — Use `skip_arc_runner_check` on variant A when runners are not registered to the fork; variant B still requires a runner labeled `kubevirt-plugin-ci`.
5. **Workflow hygiene** — Resolve open TODOs in `poc-e2e-ci-test2.yml` (dependency caching, optional `cypress-io/github-action`). Consider pinning `actions/checkout` major versions consistently across workflows.
6. **Verify auto-teardown** — Confirm scheduled **IBM Cloud Hot Cluster Auto-Teardown** successfully dispatches **IBM Cloud Hot Cluster Teardown** (`workflow_id` must match `ibmc-cluster-teardown.yml`).

## Production and hardening review (before treating POC patterns as prod)

| Technique / choice                                           | Risk or limitation                                                                              | Hardening direction                                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Privileged dind + broad SCC (`github-arc`)**               | High blast radius on the node; runner compromise ≈ strong cluster access                        | Narrow SCC, dedicated nodes, separate scale sets per trust zone, audit images         |
| **`oc whoami --show-token` in `start-console.sh`**           | Long-lived bearer token injected into console container env                                     | Short-lived tokens, dedicated read-only SA, rotate; never log unmasked                |
| **Self-signed TLS for plugin (`start-plugin-container.sh`)** | MITM within pod network if mis-scoped                                                           | Match operator-style serving certs; trust only where `InsecureSkipVerify` is explicit |
| **`ttl.sh` or ephemeral public registries**                  | Ephemeral tags, no provenance, rate/abuse limits                                                | Internal registry + image signing, digest pinning                                     |
| **Skip `npm audit` / `--ignore-scripts`**                    | Supply-chain and lifecycle scripts not run                                                      | Revisit for production pipelines; use lockfile + audited base images                  |
| **Cluster-scoped mutations in `test-setup.sh`**              | Variant A may patch shared ConfigMaps                                                           | Prefer namespaced fixtures or dedicated test clusters                                 |
| **Ghost runner cleanup via `BOT_PAT`**                       | PAT scope and rotation                                                                          | GitHub App or org-level runner management; least privilege                            |
| **Auto-teardown idle heuristic**                             | Uses last _any_ completed workflow run (excluding a few names)—may not reflect “cluster unused” | Tie to runner job queue or explicit “last test” workflow                              |
| **Classic ROKS only in setup workflow**                      | Not IBM Cloud VPC Gen2 path                                                                     | Add a parallel path or doc if prod standardizes on VPC                                |

## POC completion score

**~55%** — **Infrastructure path is largely in place** (IBM Cloud provisioning, HCO, ARC 0.14, dind mirror, health checks, two E2E workflows, diagnostics artifacts). **Productization is incomplete**: test2 still carries registry/image shortcuts, TODOs, and a narrower Cypress entrypoint; **end-to-end “green main”** on real clusters is not yet documented as achieved. Raising the score to **~80%** means repeatable green runs on both POC variants with pinned images, no hard-coded TTL tags, and either stable full gating or an agreed minimal gate with flake budget.

## Cost Control

Bare metal nodes on IBM Cloud are expensive. The auto-teardown workflow provides automatic cost control:

- Runs every 30 minutes via cron
- Checks if any CI jobs are in-progress or queued
- If idle for more than 2 hours, triggers the teardown workflow
- Worst case: an idle cluster runs ~2.5 hours before teardown

**Important**: Always verify the cluster has been torn down if you're done testing. The auto-teardown is a safety net, not a substitute for manual cleanup.

## Troubleshooting

### Cluster setup fails during provisioning

- Check IBM Cloud status page for outages
- Verify the API key has sufficient permissions
- Bare metal availability varies by region; try a different zone

### ARC runners not registering

- Check ARC controller logs: `oc logs -n arc-systems -l app.kubernetes.io/name=gha-rs-controller`
- Verify GitHub App credentials are correct
- Ensure the GitHub App is installed on the repository

### Health check fails

- Run `ci-scripts/check-cluster-health.sh` manually with `oc` configured
- Check individual component status: `oc get pods -n kubevirt-hyperconverged`
- Verify storage: `oc get storageclass`

### `npm ci` fails in kubevirt-plugin-ci job

- **"package-lock.json is out of sync"**: Run `npm install` locally and commit the updated `package-lock.json`.
- **Node/npm version**: The workflow uses Node 22; the runner image must provide a compatible Node (or use `actions/setup-node`). Check the "Install dependencies" step log for `node -v` and `npm -v`.
- **Network**: The runner must reach the npm registry. If the cluster restricts egress, allow `registry.npmjs.org` (and any private registries).
- **RW Access**: The runner must have writable volumes for npm global configuration and package caching

### Auto-teardown never triggers teardown

- The scheduled job needs **`permissions: actions: write`** to dispatch the teardown workflow; confirm it is not overridden by org policy.
- **`workflow_id`** in the dispatch step must match the teardown workflow filename on the default branch (**`ibmc-cluster-teardown.yml`**). A mismatch silently prevents teardown from running.

### Ghost runners after failed teardown

- Go to repository Settings → Actions → Runners
- Manually delete any offline runners
- Or run the teardown workflow again (it includes ghost runner cleanup)

### ARC runner `oc` / `kubectl` permissions

Jobs on `kubevirt-plugin-ci` use the ARC scale set ServiceAccount **`kubevirt-plugin-ci-gha-rs-no-permission`** in `arc-runners`, not `default`. Without RBAC, `oc` steps fail with Forbidden.

**Default:** **`ci-scripts/arc/install-runner-scale-set.sh`** applies **`ci-scripts/arc/arc-runner-rbac.yaml`** after the scale set install (ClusterRole **`arc-runner-ci`** bound to **`${RUNNER_SCALE_SET_NAME}-gha-rs-no-permission`** in **`${ARC_RUNNERS_NS}`**). Set **`SKIP_ARC_RUNNER_RBAC=1`** if you manage bindings yourself.

**Manual apply** (defaults only, or after skipping):

```bash
oc apply -f ci-scripts/arc/arc-runner-rbac.yaml
```

If `RUNNER_SCALE_SET_NAME` or `ARC_RUNNERS_NS` differ from defaults, edit the `subjects` block or rely on **`ci-scripts/arc/install-runner-scale-set.sh`** substitution.

For a disposable or single-tenant cluster you can instead grant full cluster-admin by using the alternative ClusterRoleBinding described in the comments at the top of `ci-scripts/arc/arc-runner-rbac.yaml`.
