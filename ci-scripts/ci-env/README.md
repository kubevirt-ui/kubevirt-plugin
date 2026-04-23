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
# Install the controller (builds image, installs chart)
./ci-scripts/ci-env/install-ci-env-controller.sh

# Or with a pre-built image:
CI_ENV_CONTROLLER_IMAGE=quay.io/myorg/ci-env-controller:latest \
  ./ci-scripts/ci-env/install-ci-env-controller.sh
```

The install script resolves the controller image (building it if needed) then
runs a single `helm upgrade --install` against the `ci-env-controller` chart.

To update the controller script without rebuilding the image, edit
`ci-scripts/helm/ci-env-controller/scripts/ci-env-controller.sh` and re-run
the install script (or `helm upgrade --install` directly). The chart checksum
annotation on the Deployment triggers an automatic rolling restart.

## Chart Layout

All Kubernetes manifests live in the Helm chart under
`ci-scripts/helm/ci-env-controller/`:

```
ci-env-controller/
├── Chart.yaml
├── values.yaml
├── scripts/
│   └── ci-env-controller.sh        # Controller watch loop (inlined into ConfigMap by Helm)
└── templates/
    ├── _helpers.tpl
    ├── namespace.yaml
    ├── serviceaccount.yaml
    ├── clusterrole-controller.yaml
    ├── clusterrole-test-runner.yaml
    ├── clusterrole-console.yaml     # ci-console ClusterRole (used by ci-test-stack)
    ├── clusterrolebinding.yaml
    ├── role-trigger.yaml            # Allows runner SA to manage ConfigMaps in ci-env
    ├── rolebinding-runner.yaml
    ├── configmap-script.yaml        # Inlines ci-env-controller.sh via .Files.Get
    └── deployment.yaml
```

## Configuration

`values.yaml` defaults — override via `--set` or a values file:

| Value                  | Default                                    | Description                              |
| ---------------------- | ------------------------------------------ | ---------------------------------------- |
| `image`                | _(required)_                               | Controller pod image                     |
| `namespace`            | `ci-env`                                   | Namespace for controller and ConfigMaps  |
| `ttlSeconds`           | `7200`                                     | Force-clean stale environments (seconds) |
| `label`                | `ci.kubevirt-plugin/type=test-environment` | ConfigMap label selector                 |
| `helmChartPath`        | `/opt/ci-env/helm/ci-test-stack`           | Path to embedded Helm chart in image     |
| `consoleImageRegistry` | `quay.io/openshift/origin-console`         | Base registry for auto-resolved console  |
| `runner.saName`        | `kubevirt-plugin-ci-gha-rs-no-permission`  | ARC runner ServiceAccount name           |
| `runner.saNamespace`   | `arc-runners`                              | ARC runner ServiceAccount namespace      |

## Files

| File                           | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `install-ci-env-controller.sh` | Thin install wrapper: resolves image, runs helm |
| `README.md`                    | This file                                       |

## Relationship to ARC

The controller is fully independent of the ARC installation. It runs in its own
namespace (`ci-env`) with its own ServiceAccount and ClusterRole. The only
connection is a namespaced RoleBinding (in the chart) that allows the ARC
runner SA to create ConfigMaps in `ci-env`.

The `ci-console` ClusterRole (required by the ci-test-stack chart) is also
owned by this chart, so the ci-env-controller must be installed before any
test runs.

## Future Work

- **Authenticated console mode**: Return a login Secret in the ConfigMap so the
  console can run with `BRIDGE_USER_AUTH` enabled for production-like testing.
- **CRD evolution**: Replace ConfigMaps with a proper `CITestEnvironment` CRD
  for structured status and validation webhooks.
