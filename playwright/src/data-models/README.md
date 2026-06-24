# Data Models

Constants, type definitions, and test metadata for the ported test framework.

## Overview

Data models provide:

- **Constants** — well-known resource names, template names, disk names, etc.
- **Test metadata** — tier tags, suite/feature strings, tag constants (mapped to Playwright annotations)
- **Type definitions** — shared TypeScript interfaces and CRD type re-exports

```
Tests → Data Models (constants, types) → Factories → Generated Data
```

## Structure

### Test Tags (`test-tags.ts`)

Tier tags and metadata strings. Always use these instead of hardcoded strings:

```typescript
import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/test-tags';

utils.withAnnotations({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
test.describe('...', { tag: [T1_TAG] }, ...);
```

### Kubernetes Types (`kubernetes-types.ts`)

Generic Kubernetes API resource shapes (`KubernetesResource`, `KubernetesObjectMeta`, `KubernetesListResource`, `JsonPatchOp`, `KubernetesCondition`) used by the client layer for dynamic property access and generic CRUD operations.

### KubeVirt Types (`kubevirt-types.ts`)

Strongly-typed CRD re-exports from the plugin's `@kubevirt-ui-ext/kubevirt-api` package: `V1VirtualMachine`, `V1VirtualMachineInstance`, `V1beta1DataVolume`, `V1beta1VirtualMachineSnapshot`, etc. Used by domain-specific handlers for type-safe return values.

### Constants (`constants.ts`)

All well-known constant groups: `INSTANCE_TYPES`, `TEMPLATE_METADATA_NAMES`, `DISK_NAMES`, `CHECKUP_NAMES`, etc.

## Usage

```typescript
import { INSTANCE_TYPES, TEMPLATE_METADATA_NAMES } from '@/data-models';
import { T1, T1_TAG } from '@/data-models/test-tags';

const vmName = generateRandomVmName('it');
await k8sClient.vm.createFromTemplate(TEMPLATE_METADATA_NAMES.RHEL9, vmName, ns);
```

## Best Practices

- Import metadata constants from `@/data-models/test-tags` — never hardcode tier strings
- Use `TEMPLATE_METADATA_NAMES.*` instead of raw template name strings
- Use CRD types from `@/data-models/kubevirt-types` for typed handler return values; keep `KubernetesResource` for generic operations
