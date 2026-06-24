# Data Factories

Test data generation using the Factory pattern. Factories create consistent, valid YAML/JSON payloads for Kubernetes resources used in tests.

## Overview

Factories provide:

- **Consistent Data** — standard, well-formed resource specs
- **Flexibility** — configurable parameters (OS, CPU, memory, workload)
- **Validity** — properly structured YAML/JSON
- **Reusability** — shared across multiple spec files

```
Tests / Clients → Factories → Generated YAML/Data → k8sClient.createCustomResource(...)
```

## Available Factories

| Factory                      | Builds                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `template-factory.ts`        | VM template manifests                                         |
| `template-presets.ts`        | Pre-configured template combinations (RHEL9, Fedora, Windows) |
| `template-yaml-helpers.ts`   | YAML generation helpers for templates                         |
| `vm-metrics-mock-factory.ts` | Mock Prometheus metric responses for testing                  |
| `base-data-factory.ts`       | Abstract base with common builder patterns                    |

## Usage in Tests

```typescript
import { TemplateFactory } from '@/data-factories/template-factory';

const templateYaml = TemplateFactory.buildRhel9Template(templateName, namespace);
```

## Best Practices

- Use factories for all test resource definitions instead of hardcoded YAML strings
- Provide required parameters; rely on sensible defaults for optional ones
