# Project Dependencies

Global setup and teardown for Playwright, powered by a declarative **rule engine**. Each concern (auth, cluster prep, browser login, cleanup) is an isolated rule with its own guard, error strategy, and phase — replacing the previous monolithic if/else orchestration.

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Entry points](#entry-points)
- [Rule engine](#rule-engine)
- [Setup rules](#setup-rules)
- [Teardown rules](#teardown-rules)
- [Environment variables](#environment-variables)
- [Playwright wiring](#playwright-wiring)
- [Configuration sharing](#configuration-sharing)
- [Related documentation](#related-documentation)

---

## Overview

| Aspect                | Behavior                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Execution             | Once before all tests (setup), once after (teardown)                                          |
| Namespace persistence | The primary test namespace is kept for reuse; extra `pw-*` namespaces are removed on teardown |

```
Test run
  → global.setup.ts   (thin entry point → RuleEngine.runSetup)
  → workers (parallel)
  → global.teardown.ts (thin entry point → RuleEngine.runTeardown)
```

---

## Architecture

```
global.setup.ts / global.teardown.ts
  │  Build context (SetupContext / TeardownContext)
  │  Instantiate RuleEngine
  └─▶ engine.runSetup(rules, ctx) / engine.runTeardown(rules, ctx)
        │
        ├── rule-engine/types.ts     ── Phases, scopes, rule interfaces, engine class
        ├── rule-engine/setup-rules.ts   ── Ordered setup rule definitions
        ├── rule-engine/teardown-rules.ts ── Ordered teardown rule definitions
        └── rule-engine/index.ts     ── Re-exports
```

The entry points (`global.setup.ts`, `global.teardown.ts`) are thin — they build the context object from environment variables and delegate all work to the rule engine.

---

## Entry points

| File                 | Role                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `global.setup.ts`    | Builds `SetupContext` (paths, namespaces), creates `RuleEngine`, runs `getSetupRules()`            |
| `global.teardown.ts` | Loads test config, creates `KubernetesClient`, builds `TeardownContext`, runs `getTeardownRules()` |

---

## Rule engine

Defined in `rule-engine/types.ts`.

### Core types

| Type              | Purpose                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `SetupPhase`      | Enum: `AUTH → CLUSTER → BROWSER`                                                                 |
| `TeardownScope`   | Enum: `NAMESPACE → CLUSTER → FILES`                                                              |
| `SetupRule`       | `{ id, name, phase, run, guard?, onError }`                                                      |
| `TeardownRule`    | `{ id, name, scope, run, guard?, onError }`                                                      |
| `SetupContext`    | Mutable context passed through setup rules (kubeconfig path, namespaces, K8s client, auth token) |
| `TeardownContext` | Context passed through teardown rules (namespace, K8s client)                                    |
| `RuleEngine`      | Executes rules grouped by phase/scope, respects guards and error strategies                      |

### Execution model

1. Rules are grouped by phase (setup) or scope (teardown) and run in declaration order within each group
2. **Guard**: `guard(ctx) → boolean` — if `false`, the rule is skipped with a log message
3. **Error strategy**: `onError` controls what happens when `run()` throws:
   - `'throw'` — propagate the error (fails the setup)
   - `'warn'` — log and continue to the next rule
   - `'skip'` — silently continue

---

## Setup rules

Defined in `rule-engine/setup-rules.ts`. Returned by `getSetupRules()`.

### AUTH phase

| Rule ID              | Name                                      | Guard                  | onError |
| -------------------- | ----------------------------------------- | ---------------------- | ------- |
| `copy-ci-kubeconfig` | Copy CI kubeconfig from `/tmp/kubeconfig` | No existing kubeconfig | warn    |
| `oc-login`           | Generate kubeconfig via `oc login`        | No existing kubeconfig | warn    |
| `oauth-login`        | Generate kubeconfig via OAuth             | No existing kubeconfig | throw   |
| `init-k8s-client`    | Initialize K8s client and verify auth     | —                      | throw   |

Auth rules run in order; the first to set `ctx.effectiveKubeConfigPath` causes subsequent auth rules to be skipped via their guard. This provides a fallback chain: CI kubeconfig → `oc login` → OAuth.

### CLUSTER phase

| Rule ID                     | Name                                         | Guard                      | onError |
| --------------------------- | -------------------------------------------- | -------------------------- | ------- |
| `start-cluster-janitor`     | Start native ClusterJanitor background sweep | `ENABLE_CLUSTER_JANITOR=1` | warn    |
| `setup-test-namespace`      | Create/ensure test namespace                 | —                          | throw   |
| `enable-vm-folders`         | Enable tree view folders in ConfigMap        | —                          | warn    |
| `grant-kubevirt-access`     | Grant test user KubeVirt RBAC                | `NON_PRIV=1`               | warn    |
| `set-default-storage-class` | Set default StorageClass for VMs             | Not non-priv               | warn    |
| `save-config`               | Persist `SharedTestConfig` for workers       | —                          | throw   |

### BROWSER phase

| Rule ID                   | Name                                            | Guard                | onError |
| ------------------------- | ----------------------------------------------- | -------------------- | ------- |
| `browser-login`           | Launch Chromium and login to console            | —                    | throw   |
| `dismiss-welcome-modals`  | Dismiss core and virtualization welcome modals  | Not `IGNORE_WELCOME` | warn    |
| `navigate-virtualization` | Switch to Virtualization perspective            | Not ACM              | warn    |
| `set-default-project`     | Set test namespace as active project            | Not ACM              | warn    |
| `save-storage-state`      | Save Playwright storage state and close browser | —                    | warn    |

The `browser-login` rule skips the login form when `WEB_CONSOLE_URL` points to localhost. Browser state is shared across browser-phase rules via a closure variable.

---

## Teardown rules

Defined in `rule-engine/teardown-rules.ts`. Returned by `getTeardownRules()`.

### NAMESPACE scope

Cleanup of namespaced resources:

| Rule ID                       | Name                                             | Guard | onError |
| ----------------------------- | ------------------------------------------------ | ----- | ------- |
| `cleanup-templates`           | Delete test templates in namespace               | —     | warn    |
| `cleanup-instance-types`      | Delete namespaced instance types                 | —     | warn    |
| `cleanup-migration-plans`     | Delete migration plans                           | —     | warn    |
| `cleanup-vms`                 | Delete test VMs                                  | —     | warn    |
| `cleanup-bootable-volumes`    | Delete bootable volumes / data sources           | —     | warn    |
| `cleanup-namespace-resources` | Final namespace sweep via `cleanupTestNamespace` | —     | warn    |

### CLUSTER scope

Cluster-wide cleanup:

| Rule ID                          | Name                                | Guard                      | onError |
| -------------------------------- | ----------------------------------- | -------------------------- | ------- |
| `cleanup-migration-policies`     | Delete cluster migration policies   | —                          | warn    |
| `cleanup-cluster-instance-types` | Delete cluster instance types       | —                          | warn    |
| `restore-hco`                    | Restore HyperConverged defaults     | —                          | warn    |
| `cleanup-extra-namespaces`       | Delete stale `pw-*` namespaces      | —                          | warn    |
| `cluster-janitor-teardown`       | ClusterJanitor final blocking sweep | `ENABLE_CLUSTER_JANITOR=1` | skip    |

### FILES scope

Local artifact cleanup:

| Rule ID                 | Name                                                | Guard         | onError |
| ----------------------- | --------------------------------------------------- | ------------- | ------- |
| `cleanup-kubeconfig`    | Delete kubeconfig file                              | Not `DEBUG=1` | warn    |
| `cleanup-storage-state` | Delete storage state file                           | —             | warn    |
| `cleanup-test-config`   | Delete test config via `TestConfigManager`          | —             | warn    |
| `cleanup-empty-dirs`    | Prune empty `.kubeconfigs`, `.storage-states`, etc. | —             | skip    |

Cleanup failures are logged; teardown never fails the suite.

---

## Environment variables

| Variable                       | Effect                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `SKIP_GLOBAL_SETUP=true`       | Exit setup immediately (orchestration assumed)                                               |
| `SKIP_GLOBAL_TEARDOWN=true`    | Exit teardown immediately                                                                    |
| `ENABLE_CLUSTER_JANITOR=1`     | Enable native ClusterJanitor: background sweep during run + final sweep at teardown          |
| `CLUSTER_JANITOR_INTERVAL_MS`  | Background sweep interval in milliseconds (default: `60000`)                                 |
| `CLUSTER_JANITOR_STALE_AGE_MS` | Age threshold after which a `pw-*` resource is considered stale (default: `600000` / 10 min) |
| `DEBUG=1`                      | Teardown: skip resource cleanup and keep kubeconfig                                          |
| `NON_PRIV=1`                   | Guards: skip default StorageClass, grant KubeVirt RBAC to test user                          |
| `ON_ACM=1`                     | Guards: skip virtualization perspective navigation, skip default project                     |
| `IGNORE_WELCOME=1`             | Guards: skip welcome modal handling                                                          |

See [Utils documentation](../src/utils/README.md) for `EnvVariables`, `TestConfigManager`, and other flags.

---

## Playwright wiring

In `playwright.config.ts`:

```typescript
globalSetup: require.resolve('./project-dependencies/global.setup.ts'),
globalTeardown: require.resolve('./project-dependencies/global.teardown.ts'),
```

---

## Configuration sharing

Workers do not share memory with setup. Setup persists `SharedTestConfig` (kubeconfig path, namespaces, token, etc.) via `TestConfigManager` so workers read `.test-config.json`. Teardown deletes config and local artifacts unless debug paths apply.

Cluster URL and console URL must refer to the same cluster for UI session and API auth to match.

---

## Related documentation

- [Main Playwright README](../README.md)
- [Utils](../src/utils/README.md) — `EnvVariables`, `TestConfigManager`, logging
- [Clients](../src/clients/README.md) — `KubernetesClient` used during setup and teardown
- [Playwright global setup/teardown](https://playwright.dev/docs/test-global-setup-teardown)

**Last updated:** June 2026  
**Primary files:** `global.setup.ts`, `global.teardown.ts`, `rule-engine/`
