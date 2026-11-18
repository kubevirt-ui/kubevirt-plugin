# Playwright test container (main)

Container image and runner for **kubevirt-plugin** E2E on the `main` branch. Image tag defaults to **`latest`**.

## Quick start

From the **repository root**:

```bash
playwright/containers/run-tests-container.sh build

# Gating lane (set WEB_CONSOLE_URL + OPENSHIFT_PASSWORD or BRIDGE_* in .env / env)
playwright/containers/run-tests-container.sh test --project=Gating --workers=4

playwright/containers/run-tests-container.sh test-tag @tier1 --project=Tier1 --workers=4
playwright/containers/run-tests-container.sh show-report
```

## Image contents

| Component | Notes                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------- |
| Base      | `mcr.microsoft.com/playwright:v1.59.1-noble` — **must match** `@playwright/test` in root `package.json` |
| CLI       | `oc`, `kubectl` (`virtctl` is on the Jenkins agent, not in the image)                                   |
| Reports   | Java 17 + `allure-commandline` for Jenkins / local `allure generate`                                    |
| npm       | Slim install: Playwright + Allure + `js-yaml` only (no webpack/Jest/React)                              |

## Build

```bash
playwright/containers/run-tests-container.sh build
# or
podman build -f playwright/containers/Containerfile \
  --ignorefile playwright/containers/.dockerignore \
  -t localhost/kubevirt-plugin-playwright:latest .
```

## Publish to Quay (`test-quay-build.sh`)

Build from repo root, run a **smoke test** in the image, then push tag(s).

Set `QUAY_REGISTRY`, `QUAY_USERNAME`, `QUAY_PASSWORD`, and `QUAY_REPOSITORY` in `.env`.

```bash
# Default: push quay.io/$QUAY_REPOSITORY:latest
playwright/containers/test-quay-build.sh

# Extra tag(s) from the same build
playwright/containers/test-quay-build.sh latest main

# Build + push only (skip smoke)
SMOKE_TEST=0 playwright/containers/test-quay-build.sh latest
```

Use the published image in CI or locally:

```bash
export IMAGE_NAME=quay.io/your-org/kubevirt-plugin-playwright:latest
playwright/containers/run-tests-container.sh test --project=Tier1 --workers=4
```

## Runtime mounts

The runner bind-mounts `playwright/`, `playwright.config.ts`, artifact dirs (`allure-results`, `junit-results`, `test-results`), and `.kubeconfigs` / `.storage-states` so results match local `./playwright-runner.sh` layout.

## Environment

Same variables as local Playwright runs: `WEB_CONSOLE_URL`, `OPENSHIFT_USERNAME`, `OPENSHIFT_PASSWORD`, `NON_PRIV`, `PLAYWRIGHT_PROJECT`, `KUBECONFIG`, `USE_ALLURE`, etc. The runner forwards them into the container.

## CI (Prow / Jenkins)

`test-prow-e2e.sh` exports `BRIDGE_BASE_ADDRESS` and `BRIDGE_KUBEADMIN_PASSWORD` from the cluster; `scripts/playwright-env.sh` maps those to `WEB_CONSOLE_URL` / `OPENSHIFT_PASSWORD` when `CI=1`. Global setup logs in and writes `.storage-states/test-state.json`.

```bash
npm run test-playwright-headless -- --project="${PLAYWRIGHT_PROJECT}"
```

Artifact paths: `junit-results/junit.xml`, `allure-results/`.

## Version bumps

When upgrading `@playwright/test`:

1. Update root `package.json` / `package-lock.json`
2. Change the `FROM mcr.microsoft.com/playwright:vX.Y.Z-noble` line in `Containerfile`
3. Rebuild the image
