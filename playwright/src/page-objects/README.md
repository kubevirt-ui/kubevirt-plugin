# Page Objects

UI interaction layer. Each class encapsulates Playwright locators and raw browser interactions for a functional area. Page objects never contain test logic — they expose typed methods for tests and clients to call.

## Structure

```
page-objects/
├── base-page.ts          # BasePage — locator(), robustClick(), goTo()
├── page-commons.ts       # PageCommons — shared UI patterns (modals, tree view, notifications)
├── vm/                   # Virtual Machines list, detail, tree view, overview tab
├── vm-wizard/            # VM creation wizard pages
├── create-vm/            # Templates, instance types, bootable volumes pages
├── overview/             # Overview dashboard
├── settings/             # Settings page
└── cluster/              # Checkups, migration policies, quotas, storage class, login
```

## Base Classes

| Class         | File              | Purpose                                                                                                     |
| ------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `BasePage`    | `base-page.ts`    | Root base — wraps `Page`, provides `this.locator()`, `this.robustClick()`, `this.goTo()`                    |
| `PageCommons` | `page-commons.ts` | Extended base — shared patterns: welcome modal, tree view, project selector, notifications, table filtering |

All page objects extend either `BasePage` or `PageCommons`.

## Conventions

- **Selectors**: `[data-test="..."]` preferred, semantic ARIA when no data attribute exists
- **Locator properties**: `private readonly _name = this.locator('...')` — only when used by 2+ methods
- **Override keyword**: methods overriding a base class method must carry the `override` modifier
- **No test logic**: page objects return values or throw; assertions live in spec files
- **Export**: `export default class FooPage extends PageCommons`

## Usage in Tests

Page objects are injected into tests via the gating fixture. Tests never instantiate page objects directly.

```typescript
import { expect, test } from '@/fixtures/gating-fixture';

test('my test', async ({ vmListPage, pageCommons }) => {
  await vmListPage.navigateToVirtualMachinesViaUI();
  expect.soft(await pageCommons.verifyTextVisible('VirtualMachines')).toBe(true);
});
```
