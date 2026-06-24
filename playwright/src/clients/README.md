# Clients

API clients for interacting with OpenShift/Kubernetes clusters. Clients provide programmatic access to cluster resources and handle authentication, resource operations, and verification.

## Overview

The clients module provides abstraction layers for cluster interactions:

- **Cluster Authentication** — Login and token management
- **API Access** — Kubernetes and OpenShift APIs
- **Resource Operations** — CRUD operations on cluster resources

```
Tests / Page Objects → Clients → Cluster API
```

## Architecture

### Client Hierarchy

```
BaseClient (base-client.ts)
├─ Authentication configuration
├─ Cluster connection details
└─ Common client interface

KubernetesClient (kubernetes-client.ts)
  └─ Uses @kubernetes/client-node library
  └─ Facade delegating to domain handlers (vm, namespace, template, …)
  └─ Token-based authentication
```

## Available Clients

### KubernetesClient

Direct Kubernetes API access for verification and resource management. Delegates to domain handlers exposed as properties:

| Property            | Handler                 | Domain                   |
| ------------------- | ----------------------- | ------------------------ |
| `client.vm`         | `VirtualMachineHandler` | VMs, VMIs                |
| `client.namespace`  | `NamespaceHandler`      | Namespaces, RBAC         |
| `client.template`   | `TemplateHandler`       | VirtualMachineTemplates  |
| `client.dataVolume` | `DataVolumeHandler`     | DataVolumes, DataSources |
| `client.snapshot`   | `SnapshotHandler`       | VirtualMachineSnapshots  |
| `client.node`       | `NodeHandler`           | Nodes                    |
| `client.hco`        | `HyperConvergedHandler` | HyperConverged config    |
| `client.secret`     | `SecretHandler`         | Secrets                  |

## Handlers (`handlers/`)

Handlers encapsulate domain-specific K8s operations grouped by resource type:

| Handler                           | Operations                                           |
| --------------------------------- | ---------------------------------------------------- |
| `vm-handler.ts`                   | Create VM, get VM, list VMs, delete VM               |
| `vm-lifecycle-handler.ts`         | Start, stop, restart, pause, unpause, migrate        |
| `vm-patch-handler.ts`             | Patch VM spec fields (CPU, memory, disks, networks)  |
| `vm-disk-query-handler.ts`        | Disk-related queries                                 |
| `data-volume-handler.ts`          | Create/delete DataVolumes, wait for import           |
| `template-handler.ts`             | CRUD for VM templates                                |
| `snapshot-handler.ts`             | Create/restore/delete VM snapshots                   |
| `namespace-handler.ts`            | Create/delete namespaces                             |
| `namespace-setup-handler.ts`      | Full namespace provisioning (RBAC, network policies) |
| `namespace-rbac-handler.ts`       | RBAC bindings for namespaces                         |
| `namespace-checkup-handler.ts`    | Checkup-related namespace operations                 |
| `cluster-setup-handler.ts`        | HCO patching, feature gates                          |
| `hco-handler.ts`                  | HyperConverged operator operations                   |
| `node-handler.ts`                 | Node queries, taints, labels                         |
| `secret-configmap-handler.ts`     | Secrets and ConfigMaps                               |
| `custom-resource-crud-handler.ts` | Generic custom resource CRUD                         |

## Usage in Tests

Clients are injected via fixtures. Tests access them as `k8sClient` (worker-scoped):

```typescript
test('ID(CNV-XXXXX) verify VM created via API', async ({ k8sClient, cleanup, testConfig }) => {
  const vmName = generateRandomVmName('verify');
  await k8sClient.vm.createFromTemplate(
    TEMPLATE_METADATA_NAMES.RHEL9,
    vmName,
    testConfig.testNamespace,
  );
  cleanup.trackVirtualMachine(vmName, testConfig.testNamespace);

  const vm = await k8sClient.vm.get(vmName, testConfig.testNamespace);
  expect(vm.metadata.name).toBe(vmName);
});
```

## Best Practices

- **Use `k8sClient`** — never instantiate `KubernetesClient` directly in tests; use the worker-scoped fixture
- **Error handling** — clients throw on failure; tests should assert on the result, not catch errors silently
- **Resource tracking** — after creating resources, always call `cleanup.track*()` in the spec
