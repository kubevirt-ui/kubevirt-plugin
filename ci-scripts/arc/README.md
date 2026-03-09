# GitHub Actions Runner Controller (ARC) on OpenShift

Scripts in this directory install **Actions Runner Controller** with the **`gha-runner-scale-set`** chart on **OpenShift** (ROKS or other OCP clusters). They apply a custom **SecurityContextConstraints** (`github-arc`), bind it to the runner ServiceAccount, **mirror `docker:dind`** into the internal registry (the stable Helm chart hardcodes Docker Hub; we rewrite manifests to use the mirror), build a **custom runner image** in-cluster, and apply **ClusterRole** RBAC so jobs can use `oc` / KubeVirt APIs.

All scripts expect **`oc login`** to an OpenShift cluster with permissions to create namespaces, SCC-related `ClusterRole`s, and Helm releases. They source [`../ci-tools.sh`](../ci-tools.sh) to install **helm** and **oc** locally when missing.

## Order of operations

Run from the **repository root** (paths below assume that).

1. **`setup-dind-mirror.sh`** — `oc import-image` **`docker:dind`** → `image-registry.../arc-runners/arc-docker-dind:dind` and write **`ci-scripts/generated/arc-dind-replace.env`**. Use `SKIP_DIND_MIRROR=1` only if dind is provided via **`ImageContentSourcePolicy`** or another cluster mirror (no import from Docker Hub).
2. **`setup-runner-image.sh`** — OpenShift `BuildConfig` binary build from [`runner-image/Dockerfile`](runner-image/Dockerfile) → `arc-runner-custom:latest` in the internal registry. Prints **`IMAGE_REF=...`** for automation.
3. **`install-arc-controller.sh`** — Once per cluster: namespace `arc-systems`, apply **`arc-openshift-scc.yaml`**, Helm **`gha-runner-scale-set-controller`**.
4. **`install-runner-scale-set.sh`** — Per scale set: namespace `arc-runners`, Helm **`gha-runner-scale-set`** with GitHub auth, optional **`ARC_RUNNER_IMAGE`**, Helm **post-renderer** (always for dind: injects **`--storage-driver=vfs`** for OpenShift; optional **`docker:dind` → mirror** when `arc-dind-replace.env` exists or **`ARC_DIND_INTERNAL_IMAGE`** is set), **`oc policy add-role-to-user system:openshift:scc:github-arc`** on the runner SA, apply **`arc-runner-rbac.yaml`** (unless `SKIP_ARC_RUNNER_RBAC=1`).

```bash
export ARC_CONFIG_URL="https://github.com/org/repo"
export ARC_APP_ID="..." ARC_APP_INSTALL_ID="..." ARC_APP_PRIVATE_KEY="$(cat app.pem)"
# optional: export ARC_RUNNER_IMAGE after setup-runner-image prints IMAGE_REF=

./ci-scripts/arc/setup-dind-mirror.sh
IMAGE_REF=$(./ci-scripts/arc/setup-runner-image.sh | grep '^IMAGE_REF=' | cut -d= -f2-)
export ARC_RUNNER_IMAGE="${IMAGE_REF}"

./ci-scripts/arc/install-arc-controller.sh
./ci-scripts/arc/install-runner-scale-set.sh
```

## Environment variables (summary)

| Area                   | Variables                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dind mirror**        | `ARC_RUNNERS_NS`, `SKIP_DIND_MIRROR`, `DIND_SOURCE_IMAGE`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Runner image build** | `ARC_RUNNERS_NS`, `OC_VERSION`, `VIRTCTL_VERSION`, `ARC_RUNNER_IMAGE_FILE`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Controller**         | `ARC_CONTROLLER_NS`, `ARC_CONTROLLER_INSTALL_NAME`, `ARC_VERSION`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Scale set**          | `ARC_CONFIG_URL` (required), GitHub App (`ARC_APP_ID`, `ARC_APP_INSTALL_ID`, `ARC_APP_PRIVATE_KEY`) **or** `ARC_PAT`; `RUNNER_SCALE_SET_NAME`, `MIN_RUNNERS`, `MAX_RUNNERS`, `ARC_RUNNERS_NS`, `ARC_CONTROLLER_NS`, `ARC_CONTROLLER_INSTALL_NAME`, `ARC_VERSION`, `CONTAINER_MODE` (default `dind`; use `none` to disable), `ARC_RUNNER_IMAGE`, `ARC_DIND_INTERNAL_IMAGE` (writes replace env for this run), `ARC_USE_DIND_POST_RENDER`, `ARC_RUNNER_EXTRA_VALUES`, `ARC_SCALE_SET_LABELS`, `SKIP_ARC_RUNNER_RBAC` |

Details are in each script’s header comments.

## GitHub configuration

- **GitHub App** (recommended): repository **Administration: Read and write**, organization **Self-hosted runners: Read and write**. Install the app on the target repo/org; use App ID, installation ID, and private key PEM.
- **PAT**: fine-grained or classic with sufficient repo + runner permissions (see [HOT_CLUSTER_CI.md](../HOT_CLUSTER_CI.md)).

Workflows must use `runs-on:` labels that match **`RUNNER_SCALE_SET_NAME`** (default **`kubevirt-plugin-ci`**) or every label in **`ARC_SCALE_SET_LABELS`** if set.

## Second runner scale set

Do **not** re-run **`install-arc-controller.sh`**. Set `ARC_RUNNERS_NS`, `RUNNER_SCALE_SET_NAME`, and `ARC_CONFIG_URL` (and auth) for the new set. Use **`SKIP_ARC_RUNNER_RBAC=1`** so the default **`arc-runner-ci`** `ClusterRoleBinding` (single subject) is not overwritten; then bind **`arc-runner-ci`** to the new runner SA:

`oc adm policy add-cluster-role-to-user arc-runner-ci -z <RUNNER_SCALE_SET_NAME>-gha-rs-no-permission -n <ARC_RUNNERS_NS>`

You do **not** need to re-apply **`arc-openshift-scc.yaml`**.

## Files in this directory

| File                            | Purpose                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `arc-openshift-scc.yaml`        | SCC `github-arc` + `ClusterRole` to use it                                                                                   |
| `arc-runner-rbac.yaml`          | `arc-runner-ci` ClusterRole + Binding (subject patched by install script)                                                    |
| `arc-runner-scale-set.pod.yaml` | Helm values fragment for the runner container (volumes, securityContext)                                                     |
| `arc-helm-helpers.sh`           | Shared Helm/auth helpers                                                                                                     |
| `arc-dind-post-render.sh`       | Helm post-renderer: OpenShift dind `vfs` storage driver; optional `docker:dind` swap via `../generated/arc-dind-replace.env` |
| `runner-image/Dockerfile`       | Custom runner (Node, kubectl, oc, virtctl, jq)                                                                               |

Generated **`ci-scripts/generated/arc-dind-replace.env`** is gitignored; it is produced by **`setup-dind-mirror.sh`** or by **`install-runner-scale-set.sh`** when **`ARC_DIND_INTERNAL_IMAGE`** is set.

## Further reading

- [HOT_CLUSTER_CI.md](../HOT_CLUSTER_CI.md) — secrets, dind mirror, multilabel, experimental chart notes.
- [Red Hat: ARC on OpenShift](https://developers.redhat.com/articles/2025/02/17/how-securely-deploy-github-arc-openshift)
- Upstream chart: `oci://ghcr.io/actions/actions-runner-controller-charts/gha-runner-scale-set`
