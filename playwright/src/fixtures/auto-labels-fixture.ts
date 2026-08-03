/**
 * Auto-applied labels test fixture.
 *
 * Provides page objects needed for auto-labels specs that span
 * settings, wizard, and VM detail views.
 */

import VmDetailMetadataComponent from '@/components/vm/vm-detail-metadata-component';
import { withSafeActions } from '@/page-objects/base-page';
import SettingsPage from '@/page-objects/settings/settings-page';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmCreationWizardPage from '@/page-objects/vm-wizard/vm-creation-wizard-page';
import VmTreePage from '@/page-objects/vm/vm-tree-page';

import { baseTest, expect } from './scenario-test-fixture';

interface AutoLabelsFixtures {
  metadataComponent: VmDetailMetadataComponent;
  settingsPage: SettingsPage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  vmTreePage: VmTreePage;
  vmWizardPage: VmCreationWizardPage;
}

const test = baseTest.extend<AutoLabelsFixtures>({
  metadataComponent: async ({ page }, use) => {
    await use(withSafeActions(new VmDetailMetadataComponent(page)));
  },
  settingsPage: async ({ page }, use) => {
    await use(withSafeActions(new SettingsPage(page)));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachineDetailPage(page)));
  },
  vmListPage: async ({ page }, use) => {
    await use(withSafeActions(new VirtualMachinesPage(page)));
  },
  vmTreePage: async ({ page }, use) => {
    await use(withSafeActions(new VmTreePage(page)));
  },
  vmWizardPage: async ({ page }, use) => {
    await use(withSafeActions(new VmCreationWizardPage(page)));
  },
});

export { expect, test };
