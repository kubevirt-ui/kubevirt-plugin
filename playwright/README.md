# Playwright E2E Tests

End-to-end gating test suite for the KubeVirt UI plugin, built with [Playwright](https://playwright.dev/).

---

## Prerequisites

### System Requirements

- **Node.js** >= 22.0.0
- **npm** >= 10.9.0
- **oc** CLI (OpenShift client) authenticated against the target cluster
- Access to an OpenShift cluster with CNV (OpenShift Virtualization) installed

### Recommended IDE Tooling

- **[Playwright MCP](https://playwright.dev/docs/getting-started-mcp)** — AI agent browser control via MCP server
- **[Playwright CLI](https://playwright.dev/agent-cli/introduction)** — standalone CLI for low-cost multi-step debugging
- **[Playwright Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)** — VS Code / Cursor extension for test execution, debugging, and locator picking

See [docs/developer-tooling-setup.md](docs/developer-tooling-setup.md) for project-specific configuration of all three tools.

### Fedora Setup

```bash
# Node.js via dnf (Fedora 39+)
sudo dnf install -y nodejs npm

# Or use nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Playwright system dependencies (Chromium libs)
sudo dnf install -y \
  alsa-lib atk cups-libs gtk3 libdrm libgbm libXcomposite \
  libXdamage libXrandr mesa-libEGL nss pango

# Install Playwright browsers
npx playwright install chromium

# OpenShift CLI
sudo dnf install -y openshift-clients
# Or download from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
```

### macOS Setup

```bash
# Node.js via Homebrew
brew install node@22

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.zshrc
nvm install 22
nvm use 22

# Playwright browsers (macOS has no extra system deps needed)
npx playwright install chromium

# OpenShift CLI
brew install openshift-cli
# Or download from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
```

### Project Installation

```bash
# From the project root
npm install

# Verify Playwright is working
npx playwright --version
```

---

## Environment Setup

Tests require a `.env` file at the project root (gitignored). Copy the template below and fill in your cluster values.

### `.env` file template

```dotenv
OPENSHIFT_USERNAME=kubeadmin
OPENSHIFT_PASSWORD=<your-kubeadmin-password>
CLUSTER_NAME=<cluster-name>
CLUSTER_DOMAIN=<cluster-domain>
CLUSTER_URL=https://api.<cluster-name>.<cluster-domain>:6443
WEB_CONSOLE_URL=http://localhost:9000
```

### Shell export equivalent

```bash
export OPENSHIFT_USERNAME="kubeadmin"
export OPENSHIFT_PASSWORD="<your-kubeadmin-password>"
export CLUSTER_NAME="<cluster-name>"
export CLUSTER_DOMAIN="<cluster-domain>"
export CLUSTER_URL="https://api.${CLUSTER_NAME}.${CLUSTER_DOMAIN}:6443"
export WEB_CONSOLE_URL="http://localhost:9000"
```

> **Note**: `playwright-runner.sh` auto-sources the `.env` file. When using `npx playwright test` directly, source it manually first: `set -a && source .env && set +a`.

For a full list of optional environment variables (debug mode, video, resource management, etc.), see `playwright/src/utils/env-variables.ts`.

---

## Running Tests

### Gating tests

```bash
./playwright-runner.sh test-gating              # Gating — smoke tests (no resource creation)
./playwright-runner.sh test-ci                  # Alias for test-gating (backward compat)
```

### By tag

```bash
./playwright-runner.sh test-tag @gating
```

### Debug and interactive modes

```bash
./playwright-runner.sh test-debug               # Step debugger
./playwright-runner.sh test-ui                  # Interactive test picker
```

### Direct `npx playwright` (advanced)

```bash
set -a && source .env && set +a
npx playwright test --config=playwright.config.ts --project="Gating"
```

---

## Test Scope

This branch contains **gating tests only** — smoke tests that verify core virtualization pages and flows load correctly without creating cluster resources.

| Tier       | Directory       | Purpose                                       | Resource Creation |
| ---------- | --------------- | --------------------------------------------- | ----------------- |
| **Gating** | `tests/gating/` | Smoke tests — page loads, filters, navigation | None              |

---

## Framework Architecture

The test framework lives under `playwright/src/` and follows a layered architecture:

```
Spec files (.spec.ts)
  └── import from gating-fixture
        └── injects Page Objects + Clients + Utils
              └── Page Objects compose Components
                    └── Components use locators, BaseComponent
              └── Clients use Handlers for K8s API operations
```

### Module Overview

```
playwright/src/
├── fixtures/            # Playwright test fixtures (DI layer)
├── page-objects/        # Navigable page objects (exposed via fixtures)
├── components/          # Reusable UI components (composed into pages)
├── clients/             # Kubernetes API clients
│   └── handlers/        # Domain-specific K8s operation handlers
├── data-factories/      # Resource manifest builders
├── data-models/         # Constants, types, enums
├── context-managers/    # Shared scenario state
└── utils/               # Helpers, config, logging
```

---

### Fixtures (`src/fixtures/`)

Fixtures are the dependency injection layer. The gating fixture extends `scenario-test-fixture` and exposes page objects needed by gating specs.

| Fixture                    | Used by         | Provides                                                               |
| -------------------------- | --------------- | ---------------------------------------------------------------------- |
| `scenario-test-fixture.ts` | Base for others | `page`, `k8sClient`, `cleanup`, `testConfig`, category fixtures        |
| `gating-fixture.ts`        | `gating/`       | + `bootableVolumesPage`, `templatesPage`, `vmListPage`, `settingsPage` |
| `cleanup-fixture.ts`       | Internal        | Resource tracking and cleanup logic                                    |

**Rule**: Specs import `test` and `expect` from `gating-fixture` — never from `scenario-test-fixture` directly.

---

### Page Objects (`src/page-objects/`)

Page objects represent **navigable pages** exposed directly via fixtures.

| Directory    | Responsibility                                |
| ------------ | --------------------------------------------- |
| `vm/`        | VM list, detail, tree view, overview tab      |
| `create-vm/` | VM creation, templates, bootable volumes      |
| `cluster/`   | Checkups, migration policies, storage, quotas |
| `overview/`  | Virtualization dashboard                      |
| `settings/`  | CNV settings                                  |
| `vm-wizard/` | Multi-step VM creation wizard                 |

---

### Components (`src/components/`)

Components represent **reusable UI sections** composed into page objects. They extend `BaseComponent` and are accessed through their parent page object.

---

### Clients (`src/clients/`)

Clients handle Kubernetes API operations. The main client (`KubernetesClient`) delegates to domain-specific handlers.

| File                             | Purpose                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `kubernetes-client.ts`           | Main facade — exposes `k8sClient.vm`, `k8sClient.dv`, `k8sClient.template`, etc. |
| `kubernetes-client-vm.ts`        | VM-specific operations                                                           |
| `kubernetes-client-cluster.ts`   | Cluster-level operations (namespaces, storage classes, HCO)                      |
| `kubernetes-client-resources.ts` | Generic CRUD for arbitrary resources                                             |
| `kubernetes-auth.ts`             | Authentication, token refresh                                                    |
| `kubernetes-proxy.ts`            | OpenShift console-proxy requests                                                 |
| `base-client.ts`                 | Abstract base with retry, error handling                                         |

---

### Data Factories (`src/data-factories/`)

Build valid Kubernetes resource manifests for test data. Currently only template-related factories are used by gating tests.

---

## Writing Gating Tests

### File naming

`scenario-<feature-name>.spec.ts` in `tests/gating/`. Use kebab-case.

### Imports

```typescript
import { expect, test } from '@/fixtures/gating-fixture';
import { GATING_TAG } from '@/data-models/test-tags';
```

### Test structure

```typescript
import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';

test.describe('Feature area (gating)', { tag: [GATING_TAG] }, () => {
  test('Page loads with expected elements', async ({ vmListPage, pageCommons }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();

    expect
      .soft(await pageCommons.verifyTextVisible('VirtualMachines'), 'heading visible')
      .toBe(true);
  });
});
```

### Rules

- **Every test must contain `expect` or `expect.soft` assertions**
- **Prefer `expect.soft`** for non-fatal checks within a step
- **Import from `gating-fixture`** — never import `test` from `scenario-test-fixture`
- **No raw `page`** — specs never use `page.locator()`, `page.goto()`, etc.
- **No hardcoded timeouts** — use `TestTimeouts.*` constants
- **No resource creation** — gating tests are read-only smoke tests

---

## STD Documentation

See [docs/](docs/) for Software Test Description documents covering gating scenarios.

| Document                                                                                 | Spec                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| [scenario-catalog-browsing.md](docs/gating/scenario-catalog-browsing.md)                 | `scenario-create-vm-browsing.spec.ts`       |
| [scenario-vm-creation-wizard.md](docs/gating/scenario-vm-creation-wizard.md)             | `scenario-vm-creation-wizard.spec.ts`       |
| [scenario-virtualization-pages.md](docs/gating/scenario-virtualization-pages.md)         | `scenario-virtualization-pages.spec.ts`     |
| [scenario-bootable-volumes-filters.md](docs/gating/scenario-bootable-volumes-filters.md) | `scenario-bootable-volumes-filters.spec.ts` |
| [scenario-checkups-toasts.md](docs/gating/scenario-checkups-toasts.md)                   | `scenario-checkups-toasts.spec.ts`          |
| [scenario-set-default-sc.md](docs/gating/scenario-set-default-sc.md)                     | `scenario-set-default-sc.spec.ts`           |
