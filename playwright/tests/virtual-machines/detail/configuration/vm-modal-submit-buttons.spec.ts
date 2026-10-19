import VmDetailMetadataComponent from '@/components/vm/vm-detail-metadata-component';
import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG } from '@/data-models/route-tags';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import { baseTest, expect } from '@/fixtures/scenario-test-fixture';

const SUITE = 'Modal submit button disabled when no changes (CNV-96343)';
const NO_CHANGES_TOOLTIP = 'No changes have been made.';

interface ModalSubmitButtonFixtures {
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
  metadataComponent: VmDetailMetadataComponent;
}

const test = baseTest.extend<ModalSubmitButtonFixtures>({
  vmDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  metadataComponent: async ({ page }, use) => {
    await use(new VmDetailMetadataComponent(page));
  },
});

test.describe.serial(
  SUITE,
  { tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG, T1_TAG, '@nonpriv'] },
  () => {
    let ns: string;
    let vmName: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      ns = utils.generateTestNamespace('vm-submit-btn');
      await apiClient.createNamespace(ns);
      await apiClient.waitForNamespaceReady(ns);
      apiClient.trackResource('Namespace', ns);

      vmName = utils.generateRandomVmName('vm-submit-btn');
      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        ns,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, ns);

      const result = await apiClient.verifyVmCreated(vmName, ns, utils.TestTimeouts.VM_BOOTUP);
      if (!result.exists) throw new Error(`VM ${vmName} was not created`);
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });
    });

    test('Description modal: Save disabled until text changes', async ({
      vmListPage,
      vmDetailPage,
    }) => {
      await vmListPage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationDetails();

      await test.step('Open Description modal with empty description and verify Save is disabled', async () => {
        const state = await vmDetailPage.getDescriptionModalSaveButtonState(vmName);

        expect(
          state.isAriaDisabled,
          'Save button should be aria-disabled when no changes made',
        ).toBe(true);
        expect(state.tooltipText, 'Tooltip should explain no changes have been made').toBe(
          NO_CHANGES_TOOLTIP,
        );
      });

      await test.step('Type a description and verify Save becomes enabled', async () => {
        await vmDetailPage.typeInDescriptionModal('test description');
        const state = await vmDetailPage.getTabModalSaveButtonState();

        expect(
          state.isAriaDisabled,
          'Save button should be enabled after typing a description',
        ).toBe(false);
      });

      await test.step('Clear description back to empty and verify Save is disabled again', async () => {
        await vmDetailPage.typeInDescriptionModal('');
        const state = await vmDetailPage.getTabModalSaveButtonState();

        expect(
          state.isAriaDisabled,
          'Save button should be disabled after clearing back to initial empty value',
        ).toBe(true);
      });

      await vmDetailPage.cancelTabModal();
    });

    test('Workload profile modal: Save disabled until value changes', async ({
      vmListPage,
      vmDetailPage,
    }) => {
      await vmListPage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationDetails();

      await test.step('Open Workload profile modal and verify Save is disabled', async () => {
        await vmDetailPage.openWorkloadProfileModal(vmName);
        const state = await vmDetailPage.getTabModalSaveButtonState();

        expect(
          state.isAriaDisabled,
          'Save button should be aria-disabled when workload profile is unchanged',
        ).toBe(true);
        expect(state.tooltipText, 'Tooltip should explain no changes have been made').toBe(
          NO_CHANGES_TOOLTIP,
        );
      });

      await vmDetailPage.cancelTabModal();
    });

    test('Labels modal: Save disabled until labels change', async ({
      vmListPage,
      vmDetailPage,
      metadataComponent,
    }) => {
      await vmListPage.navigateToVmViaTreeView(ns, vmName);
      await vmDetailPage.navigateToConfigurationMetadata();

      await test.step('Open Labels modal and verify Save is disabled', async () => {
        await metadataComponent.openAddLabelsModal();
        const disabled = await metadataComponent.labelsModal.isSaveDisabled();
        const tooltipText = await metadataComponent.labelsModal.getSaveButtonTooltipText();

        expect(disabled, 'Save button should be disabled when no labels changed').toBe(true);
        expect(tooltipText, 'Tooltip should explain no changes have been made').toBe(
          NO_CHANGES_TOOLTIP,
        );
      });

      await test.step('Add a new label and verify Save becomes enabled', async () => {
        await metadataComponent.labelsModal.addLabelRow();
        await metadataComponent.labelsModal.fillNewLabelKey('test-key');
        const disabled = await metadataComponent.labelsModal.isSaveDisabled();

        expect(disabled, 'Save button should be enabled after adding a label').toBe(false);
      });

      await metadataComponent.labelsModal.close();
    });
  },
);
