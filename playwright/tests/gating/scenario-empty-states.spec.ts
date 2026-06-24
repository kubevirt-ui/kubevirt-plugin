import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const EMPTY_NS_PREFIX = 'pw-empty-states';

test.describe('Empty state pages (gating)', { tag: [GATING_TAG] }, () => {
  let emptyNamespace: string;

  test.beforeAll(async ({ k8sClient }) => {
    emptyNamespace = await setupTestNamespace(k8sClient, EMPTY_NS_PREFIX);
  });

  test.afterAll(async ({ k8sClient }) => {
    if (emptyNamespace) {
      await k8sClient.deleteNamespace(emptyNamespace).catch(() => undefined);
    }
  });

  test('Empty state validation across virtualization pages', async ({
    checkupsPage,
    vmCreationWizardPage,
    vmListPage,
    vmWizardBootSourcePage,
  }) => {
    await test.step('VM list shows empty state for project without VMs', async () => {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmListPage.tree.toggleEmptyProjectsDisplay(true);
      await vmListPage.tree.searchTreeView(emptyNamespace);

      await expect
        .poll(() => vmListPage.tree.isTreeNodeVisible(emptyNamespace), {
          message: 'Empty namespace should appear in tree view',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();

      await vmListPage.tree.clickProjectNode(emptyNamespace);
      await vmListPage.overviewWidgets.clickVmListTab();

      await expect
        .poll(() => vmListPage.emptyState.isNoVMsMessageVisible(), {
          message: 'VM empty state heading should be visible',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();
    });

    await test.step('Checkups shows empty state', async () => {
      await checkupsPage.navigateToCheckupsViaUI();
      await checkupsPage.projectDropdown.switchToNamespace(emptyNamespace);

      await expect
        .poll(() => checkupsPage.isRunCheckupButtonVisible(), {
          message: 'Run checkup button should be visible on empty checkups page',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();
    });

    await test.step('Wizard boot source shows no volumes for empty project', async () => {
      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmCreationWizardPage.openWizardFromCreateDropdown();
      await vmCreationWizardPage.ensureVmNameFilled();
      await vmCreationWizardPage.clickNext();
      await vmCreationWizardPage.clickNext();
      await vmWizardBootSourcePage.verifyBootSourceStepVisible();
      await vmWizardBootSourcePage.selectVolumesProject(emptyNamespace);

      await expect
        .poll(() => vmWizardBootSourcePage.verifyBootVolumeTableOrEmptyState(), {
          message: 'Boot volume table or empty state should be visible after project switch',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();

      await vmCreationWizardPage.cancelWizard();
    });

    await test.step('Wizard template catalog shows no templates for empty project', async () => {
      await vmCreationWizardPage.openWizardFromCreateDropdown();
      await vmCreationWizardPage.ensureVmNameFilled();
      await vmCreationWizardPage.selectCreationMethod('fromTemplate');
      await vmCreationWizardPage.clickNext();
      await vmCreationWizardPage.selectTemplateCatalogProject(emptyNamespace);

      await expect
        .poll(() => vmCreationWizardPage.verifyEmptyProjectStateInCatalog(), {
          message: 'Templates catalog empty state should be visible',
          timeout: TestTimeouts.DEFAULT,
        })
        .toBeTruthy();

      await vmCreationWizardPage.cancelWizard();
    });
  });
});
