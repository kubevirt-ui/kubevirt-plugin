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

- [] The ARC runner pods need to be able to run docker-in-docker (dind) and manage some cluster level resources. A namespace and some secrets need to be created before the e2e tests run. Since the runner pod rbac is constrained to a single SCC and RBAC, the workflow runs probably have too many permissions. Another approach to have a higher permissions pod run and create needed resources and then allow the ARC runner to run in a lower permission pod may work, but that is currently beyond the scope of the POC.
