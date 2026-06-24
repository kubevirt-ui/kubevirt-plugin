# Utils

Cross-cutting utilities shared across the test framework. Nothing in this directory has browser or Playwright dependencies — all modules are pure TypeScript.

## Rule

Test folders (`playwright/tests/`) must not contain helper modules. Any shared logic goes here.

## Modules

| File                          | Purpose                                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `auth-healer.ts`              | Re-authenticates a stale Playwright browser context without a full restart                                            |
| `cluster-janitor.ts`          | Native in-process stale resource and namespace cleanup (`ClusterJanitor`); enabled with `ENABLE_CLUSTER_JANITOR=1`    |
| `cluster-namespace-utils.ts`  | Namespace naming, existence checks                                                                                    |
| `cluster-resource-checker.ts` | Polls Kubernetes resources for readiness conditions (VM running, DV bound, etc.)                                      |
| `env-variables.ts`            | Typed wrappers for all `.env` variables; never access `process.env` directly in tests                                 |
| `file-utils.ts`               | File I/O helpers used by global setup/teardown (config read/write, storage state paths)                               |
| `logger.ts`                   | Thin stdout/stderr logger that avoids ESLint `no-console` violations                                                  |
| `mock-responses.ts`           | Typed constants for Playwright route interception mock payloads                                                       |
| `nonpriv-utils.ts`            | Non-privileged user setup utilities                                                                                   |
| `random-data-generator.ts`    | Name/string generators (`generateRandomVmName`, `generateRandomString`, etc.) called from spec files and page objects |
| `regex-utils.ts`              | Regex helpers for selector and text matching                                                                          |
| `storage-state.ts`            | Browser storage state path resolution (admin vs non-priv session)                                                     |
| `template-constants.ts`       | Well-known template name constants shared across tests                                                                |
| `test-config.ts`              | `TestConfigManager` — reads/writes `.test-config.json` across workers; `TestTimeouts` — centralized timeout values    |
| `test-resource-tracker.ts`    | Per-test resource tracking for automatic cleanup (used by `ScenarioContextManager`)                                   |
| `test-results-dir.ts`         | Resolves the Playwright test-results output directory                                                                 |
| `test-setup-helpers.ts`       | Composite setup helpers for test fixtures                                                                             |
| `toast-test-helper.ts`        | Helper for testing PatternFly toast notifications                                                                     |
| `vm-actions-direct-k8s.ts`    | VM lifecycle via direct K8s API (non-UI)                                                                              |
| `vm-k8s-waits.ts`             | Wait for VM status transitions                                                                                        |
| `vm-navigation-helpers.ts`    | Common VM navigation patterns                                                                                         |
| `wait-helpers.ts`             | `waitForElementStable`, `waitUntil`, and other generic wait utilities                                                 |

## Conventions

- Use `EnvVariables.*` instead of `process.env.*` directly
- Use `logger` instead of `console.log` / `console.error`
- Use `TestTimeouts.*` constants instead of hardcoded millisecond values
- `random-data-generator.ts` is called from spec files and page objects; use it for all resource naming in tests
