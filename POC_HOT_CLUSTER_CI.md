# Running e2e CI on a hot cluster

This POC explores how to run e2e CI testing on a long-lived OpenShift cluster, a hot cluster. The ability to repeatedly run multiple CI tests, and multiple CI tests in parallel, can deliver a much better e2e CI experience for developers.

The work is split in a few parts:

- GitHub action workflows to manage creating, configuring and tearing down a **OpenShift on IBM Cloud (ROKS)** cluster.
- Scripts to enable a cluster to run e2e CI from GitHub actions. The scripts install the Hyperconverged Cluster Operator (HCO) to provide kubevirt, and install GitHub Action Runner Controller (ARC) to provide the self-hosted runner support to the e2e CI workflows.
- Workflows to start an "off cluster" console with the kubevirt-plugin, and then run the e2e tests

The hot cluster can be any Kubernetes cluster and is based on the GitHub Actions runner controller (ARC). It is installed via helm, and only requires network access to pull from GitHub within the cluster itself. The POC can even be run on a local CRC / OpenShift local development cluster without any special networking configuration.

---

## ROKS as the hot cluster

**ROKS** (Red Hat OpenShift Kubernetes Service) is IBM Cloud’s managed OpenShift. The hot cluster is created and destroyed through GitHub Actions (see `.github/workflows/ibmc-cluster-*.yml`): provision workers in a chosen zone/flavor, wait until the API is ready, then install the pieces below. **IBM Cloud CLI** plus `IBM_CLOUD_API_KEY` is used to pull an **admin kubeconfig** when needed—nothing long-lived is stored as a kubeconfig secret in GitHub.

Keeping the cluster **up** avoids repeating **~1 hour** (or more) of create time per test wave and lets you use workers with **real KVM** or large memory where tests need it. **Auto-teardown** workflows can still remove an idle cluster to control cost.

---

## HCO (Hyperconverged Cluster Operator)

**HCO** installs and coordinates the KubeVirt stack on OpenShift (KubeVirt, CDI, networking helpers, etc.). After the hot cluster is reachable via `oc` cli, **`ci-scripts/install-hco.sh`** deploys the operator and related resources so the cluster can run **VMs and the virtualization UI** the same way a real product cluster would. Health checks (for example **`ci-scripts/check-cluster-health.sh`**) are available to verify HCO and core virt components before tests run.

---

## ARC (Actions Runner Controller)

**ARC** is GitHub’s supported way to run **self-hosted Actions runners on Kubernetes**. A **controller** enables a **runner scale set** to provide self-hosted runners to your repo's workflows. When a job requests a `runs-on` label that matches the runner scale set, ARC starts a **runner pod** that registers with GitHub, runs the job, then exits. Each run is a container inside an ephemeral runner.

In this repo, ARC is installed with Helm charts **`gha-runner-scale-set-controller`** (once per cluster) and **`gha-runner-scale-set`** (once for each runner scale set needed).

To best support running in OpenShift, and the specific needs of the kubevirt-plugin test stack, first the scripts **`setup-dind-mirror.sh`** (to mirror `docker:dind` into the cluster registry) and **`setup-runner-image.sh`** (build a **custom runner image** with node and cypress support, etc.) are run.

Once the images are available, two scripts are used to fully setup the ARC install:

- **`ci-scripts/arc/install-arc-controller.sh`** — controller namespace, SCC, controller Helm release.
- **`ci-scripts/arc/install-runner-scale-set.sh`** — runner scale set, dind post-render, SCC bind for runner pods, RBAC for `oc` in CI jobs.

Runners default to **Docker-in-Docker (dind)** so workflow steps can use **`docker run`**. This is needed for the off-cluster console flow. GitHub authenticates ARC to the repo via a **GitHub App** (recommended) or a **PAT**. Specific details on setup and secretes needed are in **[ci-scripts/arc/README.md](ci-scripts/arc/README.md)** and **[ci-scripts/README.md](ci-scripts/README.md)**.

---

## Self-hosted runner and off-cluster E2E

E2E workflows can have jobs that use **`runs-on: kubevirt-plugin-ci`** so they execute **on the cluster** in the ARC ephemeral runners. The runners are close to the API and with `oc` RBAC. The **OpenShift console** under test is started **off-cluster**, similar to local development:

1. A workflow job builds a kubevirt-plugin container specific for the workflow run, either from the workflow's running branch or, in the future, from a PR's branch, and pushes the container to an ephemeral container repo (ttl.sh currently). As long as the container repo being pushed to can be pulled from the cluster, the container build can run on standard GitHub runners.
2. **`ci-scripts/resolve-console-image.sh`** picks an **`origin-console`** image tag that matches the cluster’s OpenShift **x.y** version.
3. **`ci-scripts/start-plugin-container.sh`** runs the **plugin** image with HTTPS and nginx (like the operator-mounted serving certs pattern).
4. **`ci-scripts/start-console.sh`** runs the **bridge** in **off-cluster** mode: bearer token and API endpoint from `oc`, **plugin URL** pointing at the plugin container on the runner host, and optional **kubevirt API proxy** via a cluster Route.

Cypress then drives the UI at **`http://localhost:9000`** while API calls go to the **real cluster**, so tests exercise **real KubeVirt** with a **local console + plugin** topology.

Orchestration lives in **`.github/workflows/poc-e2e-ci-test.yml`** (cluster health on `ubuntu-latest`, then calls **`poc-e2e-ci-test2.yml`**) and the reusable **`poc-e2e-ci-test2.yml`** workflow that performs the steps above and runs **`npm run test-cypress-headless`**.

---

## More documentation

| Doc                                                        | Purpose                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| **[`ci-scripts/README.md`](ci-scripts/README.md)**         | Secrets, workflows, troubleshooting, cost control |
| **[`ci-scripts/arc/README.md`](ci-scripts/arc/README.md)** | ARC install order, env vars, OpenShift notes      |

---

## Gaps

### Runner RBAC is overly broad

The ARC runner pods need to run docker-in-docker (dind) and interact with cluster resources: they create/delete test namespaces, manage secrets and PVCs, and drive KubeVirt resources via Cypress. All of this is currently covered by a single `ClusterRole` (`arc-runner-ci`) bound cluster-wide via `ClusterRoleBinding`.

The problem is that the `ClusterRole` grants full CRUD plus `deletecollection` on `namespaces` and `secrets` across the entire cluster. A compromised or malicious workflow running in the ARC runner pod could exfiltrate every secret on the cluster or tear down arbitrary namespaces—cluster-admin blast radius.

The core constraint is that the `poc-e2e-ci-test2.yml` workflow uses a unique namespace per run (`kubevirt-plugin-ci-test-<run_id>`) and the ARC runner is the one that creates it (`oc create namespace`), injects a secret into it, and deletes it at the end. Namespace create/delete and secret write access are load-bearing for every run, so any RBAC improvement must account for them.

Three options to address this, in order of increasing workflow restructuring required:

**Option 1 — Drop `deletecollection` only (minimal, lowest effort)**

The single most dangerous verb is `deletecollection` — it allows bulk-wiping all resources of a given type in a single API call. Removing it from the verbs list doesn't break any workflow step and immediately reduces the blast radius without touching the namespace or secret permissions that the runner needs.

The cluster-wide write access to `namespaces` and `secrets` remains, so this is a partial improvement only.

**Option 2 — Add an admission policy layer**

Keep the RBAC structure as-is but deploy an OPA Gatekeeper or Kyverno policy that restricts the runner `ServiceAccount` to:

- Creating namespaces whose name matches `kubevirt-plugin-ci-test-*` only.
- Writing secrets only within namespaces that match that same pattern.

This limits the blast radius at the admission layer rather than at the RBAC layer, without requiring any workflow changes. It does require Gatekeeper or Kyverno to be installed and maintained on the hot cluster.

**Option 3 — Split namespace provisioning into a separate standard-runner job (most robust)**

Restructure the `poc-e2e-ci-test2.yml` workflow by extracting the "Setup required namespaced resources" step into a dedicated job that runs on a standard GitHub-hosted runner (`ubuntu-latest`) using a kubeconfig with elevated rights:

1. **Provisioning job** (standard runner) — Creates `kubevirt-plugin-ci-test-<run_id>`, injects the CI secret, and applies any other pre-test cluster resources. This job holds the elevated permissions and is short-lived.
2. **Test-execution job** (ARC runner, `runs-on: kubevirt-plugin-ci`) — Receives the pre-created namespace name as a job input. Its `ClusterRole` no longer needs `namespaces` write verbs or cluster-wide `secrets` write access; it is replaced with a namespaced `Role`/`RoleBinding` bound to the test namespace, plus a minimal read-only `ClusterRole` for cluster-info queries (nodes, console URL, cluster version).

This follows least-privilege most closely and is the recommended end-state before production use. It requires workflow restructuring and is beyond the scope of the current POC.

### ARC runner Dockerfile

Noted by @coderabbitai

- **Pin the runner base image**: In `ci-scripts/arc/runner-image/Dockerfile`, the base image is using the `:latest` tag. It would be more stable and predictable if the the version is pined to a sha or a versioned tag.

- **Harden the binary downloads**: Implement checksum verification for the unconditional downloads (yq at line 38–40) and for the fallback download paths (kubectl line 75–76, oc line 88–89, virtctl line 100–101). Conditional downloads from environment variables (KUBECTL_URL, OC_URL, VIRTCTL_URL) may use console URLs that lack published checksums; document this trade-off or require verification for those paths as well.

### DIND Mirror

Noted by @coderabbitai

The default `docker.io/library/docker:dind` uses a floating tag that advances with Docker releases. While the script allows overriding via `DIND_SOURCE_IMAGE` environment variable, the default floating tag means different CI runs—weeks or months apart—could pull and mirror different dind versions underneath identical source code. Given the repo's emphasis on aligned and pinned versions for reproducibility, the dind default should either be a specific version (e.g., `docker:26.0` or a sha256 digest) or the docs should explicitly document that `DIND_SOURCE_IMAGE=docker.io/library/docker:<version>` must be set in CI to achieve reproducible runner pods.

### If adopted, hardening of the ROKS cluster handling, and cluster heath checks are needed

The workflows and scripts all function, but they should receive additional scrutiny before being adopted for real scenarios.
