# Component gallery — quick reference

Full documentation: **[`playwright/README.md` — Component tests (story gallery)](../../README.md#component-tests-story-gallery)**.

## Commands

| Command                              | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `npm run gallery:dev`                | Gallery at `http://localhost:3100/playwright/gallery/` |
| `npm run test-playwright-components` | `component-scenes` project                             |

## VM wizard example

| Piece    | Path                                                                     |
| -------- | ------------------------------------------------------------------------ |
| Scene    | `playwright/scenes/vm-wizard/VmCreationWizardShell.scene.tsx`            |
| Story id | `scenes/vm-wizard/VmCreationWizardShell/Default`                         |
| Specs    | `vm-wizard-flows.spec.ts`, `vm-wizard-navigation.spec.ts`                |
| Helpers  | `wizard-flow-helpers.ts`, `gallery-assertions.ts`                        |
| Data     | `playwright/stories/gallery-scene-data.ts` (`initialPreset="populated"`) |
| Stubs    | `playwright/stubs/*` + `playwright/gallery-deps/gallery-resolve.ts`      |
