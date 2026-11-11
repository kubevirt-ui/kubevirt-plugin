/**
 * Auto-applied labels test fixture (wizard + VM detail metadata).
 */

import VmDetailMetadataComponent from '@/components/vm/vm-detail-metadata-component';
import WizardVmNavigationPage from '@/page-objects/vm/wizard-vm-navigation-page';
import VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';

import { expect, test as createVmTest } from './create-vm-fixture';

interface AutoLabelsFixtures {
  metadataComponent: VmDetailMetadataComponent;
  vmListPage: WizardVmNavigationPage;
  vmWizardPage: VmCreationWizardPage;
}

const test = createVmTest.extend<AutoLabelsFixtures>({
  metadataComponent: async ({ page }, use) => {
    await use(new VmDetailMetadataComponent(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new WizardVmNavigationPage(page));
  },
  vmWizardPage: async ({ page }, use) => {
    await use(new VmCreationWizardPage(page));
  },
});

export { expect, test };
