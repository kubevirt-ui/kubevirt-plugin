# VM creation (release-4.22)

## Gating (`@gating`)

| Flow                                     | Spec                                |
| ---------------------------------------- | ----------------------------------- |
| PF wizard entry + method validation      | `vm-wizard-gating.spec.ts`          |
| Custom configuration → Review            | `vm-creation-wizard-gating.spec.ts` |
| Create from Template → create (CNV-8848) | `vm-creation-wizard-gating.spec.ts` |
| Clone existing VM (source via API)       | `vm-creation-wizard-gating.spec.ts` |

Page object: `VmCreationWizardPage` (`playwright/src/page-objects/vm-creation-wizard-page.ts`) — selectors aligned with kubevirt-ui 4.22 PF wizard (explored from `scenario-vm-creation-wizard.spec.ts`).

Legacy template-grid quick create remains on `VmWizardPage` for older `/vm-wizard` builds only.
