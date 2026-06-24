# Components

Reusable UI building blocks that represent sub-sections of a page. Components are **not** independently navigable — they are composed into Page Objects as `readonly` properties and accessed by tests through the parent page.

## Structure

```
components/
├── shared/               # Cross-cutting building blocks used by any page
│   ├── base-component.ts # BaseComponent — root base for ALL components
│   ├── project-dropdown-component.ts
│   ├── navigation-component.ts
│   ├── modal-component.ts
│   ├── filter-toolbar-component.ts
│   ├── kebab-menu-component.ts
│   ├── column-management-component.ts
│   ├── yaml-editor-component.ts
│   ├── perspective-component.ts
│   └── vm-actions-component.ts
├── vm/                   # VM list and detail sub-sections
├── create-vm/            # Catalog, bootable volumes, template edit
├── overview/             # Dashboard widgets, settings panels, migrations
└── vm-wizard/            # Wizard step panels (boot source, compute, review)
```

## Base Class

All components extend `BaseComponent` — never `BasePage` or `PageCommons`. `BaseComponent` is the **single source of truth** for all UI interaction primitives. No subclass re-declares these methods.

| Provided by `BaseComponent`            | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `this.page`                            | Playwright `Page` reference                        |
| `this.locator(selector)`               | Create a scoped locator                            |
| `this.robustClick(locator)`            | Click with retry, scroll, and force-click fallback |
| `this.waitForLoadingComplete()`        | Wait for spinners/skeletons to disappear           |
| `this.navigateToTab(tabLocator)`       | Click a tab and wait for content                   |
| `this.clickSave()`                     | Click a generic "Save" button                      |
| `this.clickSaveByTestId()`             | Click save by `[data-test="save-button"]`          |
| `this.clickDialogSaveButton()`         | Click save inside a dialog                         |
| `this.clickButtonByText(text)`         | Click any button by its label                      |
| `this.clickDeleteConfirmationButton()` | Confirm a delete dialog                            |
| `this.clickElementByExactText(sel, t)` | Click element matching exact text                  |
| `this.clickListboxButtonByText(text)`  | Click a button inside a listbox                    |
| `this.verifyTextVisible(text)`         | Check if text is present on page                   |
| `this.waitForCondition(fn, timeout)`   | Poll until a condition is true                     |

> **Note**: `PageCommons` overrides `verifyTextVisible()` with enhanced fallback strategies (alt-locator, container-based search). Components use the simpler `BaseComponent` version.

## Difference from Page Objects

|                      | Page Objects                                                    | Components                           |
| -------------------- | --------------------------------------------------------------- | ------------------------------------ |
| **Extends**          | `BasePage` or `PageCommons`                                     | `BaseComponent`                      |
| **Navigable**        | Yes — has URL, exposed via fixture                              | No — always accessed through a page  |
| **Context**          | Has `this.ctx`, resource tracking, `goTo()`                     | No context, no tracking, no `goTo()` |
| **File suffix**      | `*-page.ts`                                                     | `*-component.ts`                     |
| **Fixture exposure** | Injected directly into tests                                    | Never — accessed as `page.component` |
| **Component access** | Via `readonly` properties (e.g. `this.vmActions.vmActionStart`) | Via local composition                |

## Composition

Components that need other components compose them locally:

```typescript
import BaseComponent from '@/components/shared/base-component';
import VmActionsComponent from '@/components/shared/vm-actions-component';

export default class VirtualMachineDetailActionsComponent extends BaseComponent {
  readonly vmActions = new VmActionsComponent(this.page);

  async startVm(): Promise<void> {
    await this.vmActions.performVmAction('start');
  }
}
```

Page Objects compose components as properties:

```typescript
import PageCommons from './page-commons';
import VmListActionsComponent from '@/components/vm/vm-list-actions-component';
import VmListFiltersComponent from '@/components/vm/vm-list-filters-component';

export default class VirtualMachinesPage extends PageCommons {
  readonly listActions = new VmListActionsComponent(this.page);
  readonly listFilters = new VmListFiltersComponent(this.page);
}
```

Tests access components through the page:

```typescript
test('filter VM list by status', async ({ vmListPage, utils }) => {
  await vmListPage.navigateToNamespaceVirtualMachinesViaUI(utils.EnvVariables.testNamespace);
  await vmListPage.listFilters.filterByStatus('Running');
  const count = await vmListPage.listActions.getVisibleRowCount();
  expect.soft(count, 'Filtered list should show running VMs').toBeGreaterThan(0);
});
```

## Conventions

- **Selectors**: `private readonly _name = this.locator('[data-test="..."]')` — underscore prefix for locator properties
- **No test logic**: components return data or perform actions; assertions belong in spec files
- **No context managers**: components don't track resources or manage scenario state
- **Local composition**: if a component needs another component, instantiate it as a `readonly` property
- **Export**: `export default class FooComponent extends BaseComponent`

## Adding a Component

1. Choose the correct subfolder (`shared/`, `vm/`, `create-vm/`, `overview/`, `vm-wizard/`)
2. Extend `BaseComponent`
3. Define locators as `private readonly` properties
4. Expose interaction methods that page objects or other components will call
5. Compose into the appropriate page object as a `readonly` property
6. Update `gating-fixture.ts` if the component's page object is exposed there
