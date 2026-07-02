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
  ├── cluster-health-check (ubuntu-latest)
  └── run-e2e-tests (workflow_call → hot-cluster-e2e-run.yml)

hot-cluster-e2e-run.yml → "Hot Cluster E2E Run"
  ├── check-runner (ARC runner diagnostics)
  ├── build-kubevirt-plugin-image (podman build + push to ttl.sh)
  └── run-gating-tests (runs-on: kubevirt-plugin-ci)
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
| `BOT_PAT`           | PAT with repo admin scope for ghost runner cleanup                          |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL for credential notifications on cluster creation |

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

## Teardown

**Manual:** Actions → **IBM Cloud Hot Cluster Teardown** (select infrastructure type)

**Automatic:** The auto-teardown workflow runs every 30 minutes and tears down the cluster after 2 hours of CI inactivity. It detects both ROKS clusters (via `ibmcloud oc`) and IPI clusters (via DNS probe).

For IPI teardown, the workflow auto-discovers the latest successful setup run to download the install state (`metadata.json`) needed by `openshift-install destroy cluster`. You can also provide `ipi_setup_run_id` manually to target a specific setup run.

## Security

- The kubeconfig is **not** uploaded as a workflow artifact (the repo is public and artifacts are downloadable by anyone).
- CI runners (ARC) access the cluster via their in-cluster service account.
- Manual cluster access: use the `ibmcloud` CLI with the `IC_KEY` API key, or use the kubeadmin credentials sent to Slack on cluster creation (see CNV-91497).

## Scripts

| Script                                | Purpose                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| `install-hco.sh`                      | Installs HCO operator, HPP storage, and virtctl            |
| `check-cluster-health.sh`             | Verifies cluster, HCO, ARC, storage, console               |
| `check-roks-cluster-state.sh`         | Polls until ROKS cluster is ready                          |
| `log-ibmcloud-iam-diagnostics.sh`     | Logs IAM permissions for debugging (classic, VPC, and IPI) |
| `arc/install-arc-controller.sh`       | Installs ARC controller (once per cluster)                 |
| `arc/install-runner-scale-set.sh`     | Installs ARC runner scale set                              |
| `arc/setup-dind-mirror.sh`            | Mirrors `docker:dind` to internal registry                 |
| `ci-env/install-ci-env-controller.sh` | Installs the ConfigMap-driven CI environment controller    |

See [`arc/README.md`](arc/README.md) for ARC-specific details and [`ci-env/README.md`](ci-env/README.md) for the ci-env-controller.

## Script Configuration

All scripts accept configuration via environment variables. See the header comments in each script for details.

Key defaults:

- `KVM_EMULATION=false` (bare metal has real KVM; set `true` for VPC/shared)
- `RUNNER_SCALE_SET_NAME=kubevirt-plugin-ci` (the `runs-on:` label)
- `ARC_CONTROLLER_INSTALL_NAME=arc` (Helm release for controller)
- `CONTAINER_MODE=dind` (Docker-in-Docker for container jobs)
- `ARC_VERSION=0.14.0` (pinned Helm chart version)

## Cost Control

The auto-teardown workflow provides automatic cost control:

- Runs every 30 minutes via cron
- Checks if any E2E jobs are in-progress or queued
- If idle for more than 2 hours, triggers the teardown workflow
- Worst case: an idle cluster runs ~2.5 hours before teardown

Always verify the cluster has been torn down when done testing. The auto-teardown is a safety net, not a substitute for manual cleanup.

## Known Limitations

- **Privileged dind + broad SCC**: The `github-arc` SCC allows privileged containers for the Docker-in-Docker sidecar. Scope runner namespaces and RBAC accordingly.
- **`ttl.sh` for plugin images**: Plugin images use ephemeral `ttl.sh` tags with 2h TTL per CI run. Suitable for CI but not for long-term storage.
- **Ghost runner cleanup**: Requires `BOT_PAT` with repo admin scope. Without it, offline runners must be cleaned up manually.
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

- Run `ci-scripts/check-cluster-health.sh` manually with `oc` configured
- Check individual component status: `oc get pods -n kubevirt-hyperconverged`
- Verify storage: `oc get storageclass`

### Auto-teardown not triggering

- The scheduled job needs `permissions: actions: write` to dispatch teardown
- `workflow_id` in the dispatch step must match the teardown workflow filename on the default branch
- For IPI clusters: auto-teardown detects them via DNS probe (`api.<cluster>.cnv-ui.com`)

### `npm ci` fails on ARC runner

- Run `npm install` locally and commit the updated `package-lock.json`
- Check Node/npm version compatibility (runner image provides Node 22)
- Verify the runner can reach `registry.npmjs.org`
