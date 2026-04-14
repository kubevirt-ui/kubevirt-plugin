# CI Environment Controller

A lightweight Kubernetes controller that manages CI test environments for the
kubevirt-plugin E2E tests. It runs as a Deployment in the `ci-env` namespace
and is triggered by ConfigMap creation from ARC runner workflows.

## Why

The ARC runner previously ran `helm install` directly, which required a massive
RBAC footprint (the runner SA had to hold every permission the console SA
needed, due to Kubernetes RBAC escalation prevention). By moving environment
lifecycle into a privileged controller, the runner RBAC drops from ~170 lines
to ~30 lines.

## Architecture

```
ARC Runner                ci-env namespace              Test namespace
+-------------+     +------------------------+    +--------------------+
| Workflow     |     | ci-env-controller      |    | console Deployment |
| step:        |---->| (watches ConfigMaps)   |--->| plugin Deployment  |
| create CM    |     |                        |    | Services, Routes   |
+-------------+     +------------------------+    +--------------------+
      |                       |
      |  poll status=ready    |  patches ConfigMap
      |<----------------------+  with bridge-base-address
```

1. The **runner** creates a ConfigMap with `desired-state: present` and minimal
   input (plugin image, test namespace).
2. The **controller** discovers cluster endpoints, resolves the console image,
   creates the test namespace, deploys the Helm chart, and waits for readiness.
3. The controller patches the ConfigMap with `status: ready` and the
   `bridge-base-address` the runner needs for Cypress.
4. After tests, the runner sets `desired-state: absent` and the controller
   tears down the environment.

## ConfigMap Contract

### Runner provides (required)

| Field            | Description                              |
| ---------------- | ---------------------------------------- |
| `desired-state`  | `present` to create, `absent` to destroy |
| `plugin-image`   | Container image for the kubevirt-plugin  |
| `test-namespace` | Kubernetes namespace for the test stack  |

### Runner provides (optional overrides)

| Field           | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `console-image` | Override console image (auto-resolved from cluster version if empty) |
| `helm-release`  | Override Helm release name (defaults to ConfigMap name)              |

### Controller populates (read-only for runner)

| Field                 | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `status`              | `pending` / `provisioning` / `ready` / `error` / `cleaning` / `cleaned` |
| `bridge-base-address` | In-cluster console URL for Cypress                                      |
| `console-route`       | External Route URL for debugging                                        |
| `error-message`       | Error details (only when `status=error`)                                |

### Status Lifecycle

```
pending -> provisioning -> ready
                        -> error

ready -> (runner sets desired-state=absent) -> cleaning -> cleaned
```

## Installation

Prerequisites: `oc` logged in to OpenShift with cluster-admin, `helm` available.

```bash
# Install the controller (builds image, creates RBAC, deploys)
./ci-scripts/ci-env/install-ci-env-controller.sh

# Or with a pre-built image:
CI_ENV_CONTROLLER_IMAGE=quay.io/myorg/ci-env-controller:latest \
  ./ci-scripts/ci-env/install-ci-env-controller.sh
```

The install script:

- Creates the `ci-env` namespace
- Applies controller RBAC (ServiceAccount, ClusterRole, ClusterRoleBinding)
- Applies the `ci-console` ClusterRole
- Builds the controller image via OpenShift BuildConfig (or uses a pre-built image)
- Creates ConfigMaps from the controller script, Helm chart, and cleanup script
- Deploys the controller
- Creates a namespaced RoleBinding so the ARC runner SA can manage ConfigMaps in `ci-env`

## Configuration

Environment variables on the controller Deployment:

| Variable             | Default                                    | Description                              |
| -------------------- | ------------------------------------------ | ---------------------------------------- |
| `CI_ENV_NS`          | `ci-env`                                   | Namespace for trigger ConfigMaps         |
| `CI_ENV_TTL_SECONDS` | `7200`                                     | Force-clean stale environments (seconds) |
| `CI_ENV_LABEL`       | `ci.kubevirt-plugin/type=test-environment` | ConfigMap label selector                 |
| `HELM_CHART_PATH`    | `/opt/ci-env/helm/ci-test-stack`           | Path to Helm chart in container          |

## Files

| File                                | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `ci-env-controller.sh`              | Controller watch loop, provisioning, and cleanup logic |
| `ci-env-namespace.yaml`             | Namespace definition                                   |
| `ci-env-controller-rbac.yaml`       | ServiceAccount, ClusterRole, ClusterRoleBinding        |
| `ci-env-controller-deployment.yaml` | Deployment manifest                                    |
| `install-ci-env-controller.sh`      | Standalone install script                              |
| `controller-image/Dockerfile`       | UBI9-based image with oc, helm, jq, yq, curl           |

## Relationship to ARC

The controller is fully independent of the ARC installation. It runs in its own
namespace (`ci-env`) with its own ServiceAccount and ClusterRole. The only
connection is a namespaced RoleBinding that allows the ARC runner SA to create
ConfigMaps in `ci-env`.

## Future Work

- **Authenticated console mode**: Return a login Secret in the ConfigMap so the
  console can run with `BRIDGE_USER_AUTH` enabled for production-like testing.
- **CRD evolution**: Replace ConfigMaps with a proper `CITestEnvironment` CRD
  for structured status and validation webhooks.
