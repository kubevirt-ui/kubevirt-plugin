import type RequestContextClient from '@/clients/request-context-client';
import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { baseTest, expect } from '@/fixtures/scenario-test-fixture';
import InstanceTypesPage from '@/page-objects/create-vm/instance-types-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import {
  getDisabledInstanceTypeFamilies,
  setDisabledInstanceTypeFamilies,
} from '@/utils/instance-type-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Instance type family availability';
const DISABLED_FAMILY = 'u1';
const HIDDEN_FROM_SELECTORS_LABEL = 'Hidden from selectors';
const SHOWN_IN_SELECTORS_LABEL = 'Shown in selectors';

const test = baseTest.extend<{
  instanceTypesPage: InstanceTypesPage;
  vmListPage: VirtualMachinesPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
}>({
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
  vmWizardBootSourcePage: async ({ page }, use) => {
    await use(new VmWizardBootSourcePage(page));
  },
  vmWizardComputePage: async ({ page }, use) => {
    await use(new VmWizardComputeCustomizationPage(page));
  },
  vmWizardNavigationPage: async ({ page }, use) => {
    await use(new VmWizardNavigationPage(page));
  },
});

async function restoreDisabledFamilies(
  apiClient: RequestContextClient,
  namespace: string,
  originalFamilies: string[],
): Promise<void> {
  try {
    await setDisabledInstanceTypeFamilies(apiClient, namespace, originalFamilies);
  } catch {
    // best-effort restore
  }
}

async function navigateWizardToComputeStep(args: {
  namespace: string;
  skipBootSource?: boolean;
  vmListPage: VirtualMachinesPage;
  vmWizardBootSourcePage: VmWizardBootSourcePage;
  vmWizardComputePage: VmWizardComputeCustomizationPage;
  vmWizardNavigationPage: VmWizardNavigationPage;
}): Promise<void> {
  const {
    namespace,
    skipBootSource = false,
    vmListPage,
    vmWizardBootSourcePage,
    vmWizardComputePage,
    vmWizardNavigationPage,
  } = args;

  await vmListPage.switchToVirtualizationPerspective();
  await vmListPage.navigateToProjectVmListViaUI(namespace);
  await vmWizardNavigationPage.openWizardFromCreateDropdown();
  await vmWizardNavigationPage.generateVmName();
  await vmWizardNavigationPage.clickNext();
  await vmWizardNavigationPage.clickNext();

  await vmWizardBootSourcePage.verifyBootSourceStepVisible();
  if (skipBootSource) {
    await vmWizardBootSourcePage.selectNoBootSource();
  } else {
    const volumeCount = await vmWizardBootSourcePage.getBootVolumeCount();
    if (volumeCount > 0) {
      await vmWizardBootSourcePage.selectBootVolumeByName('rhel');
    } else {
      await vmWizardBootSourcePage.selectNoBootSource();
    }
  }
  await vmWizardNavigationPage.clickNext();

  const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
  expect(computeVisible, 'Compute resources step should be visible').toBe(true);
}

test.describe(
  SUITE,
  { tag: [ROUTE_INSTANCE_TYPES_TAG, T1_TAG, '@tier1-pages-it', ADMIN_ONLY_TAG] },
  () => {
    test('Cluster admins can manage family availability on the InstanceTypes page', async ({
      apiClient,
      instanceTypesPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

      const namespace = utils.EnvVariables.cnvNamespace;
      const originalFamilies = await getDisabledInstanceTypeFamilies(apiClient, namespace);

      try {
        await setDisabledInstanceTypeFamilies(
          apiClient,
          namespace,
          originalFamilies.filter((family) => family !== DISABLED_FAMILY),
        );

        await instanceTypesPage.navigateToInstanceTypesViaUI();
        await instanceTypesPage.waitForInstanceTypesListReady();

        await test.step('Family availability section is visible to cluster admins', async () => {
          const sectionVisible = await instanceTypesPage.isFamilyAvailabilitySectionVisible();
          expect(sectionVisible, 'Family availability section should be visible').toBe(true);

          await instanceTypesPage.expandFamilyAvailabilitySection();
          const cardVisible = await instanceTypesPage.isFamilyAvailabilityCardVisible(DISABLED_FAMILY);
          expect(cardVisible, `${DISABLED_FAMILY} availability card should be visible`).toBe(true);
        });

        await test.step('Disabling a family updates the features ConfigMap', async () => {
          await instanceTypesPage.setFamilyAvailable(DISABLED_FAMILY, false);

          await expect
            .poll(() => getDisabledInstanceTypeFamilies(apiClient, namespace), {
              message: `${DISABLED_FAMILY} should be listed as disabled in kubevirt-ui-features`,
              timeout: utils.TestTimeouts.DEFAULT,
              intervals: [1000, 2000, 3000],
            })
            .toContain(DISABLED_FAMILY);
        });

        await test.step('Disabled families show hidden status in the table', async () => {
          await instanceTypesPage.navigateToInstanceTypesViaUI();
          await instanceTypesPage.waitForInstanceTypesListReady();
          await instanceTypesPage.filterByName('u1.');

          await expect
            .poll(() => instanceTypesPage.getFamilyStatusLabelText(DISABLED_FAMILY), {
              message: 'u1 family rows should show hidden status',
              timeout: utils.TestTimeouts.DEFAULT,
              intervals: [1000, 2000, 3000],
            })
            .toContain(HIDDEN_FROM_SELECTORS_LABEL);
        });

        await test.step('Re-enabling a family restores shown status', async () => {
          await instanceTypesPage.setFamilyAvailable(DISABLED_FAMILY, true);

          await expect
            .poll(() => getDisabledInstanceTypeFamilies(apiClient, namespace), {
              message: `${DISABLED_FAMILY} should be removed from disabled families`,
              timeout: utils.TestTimeouts.DEFAULT,
              intervals: [1000, 2000, 3000],
            })
            .not.toContain(DISABLED_FAMILY);

          await instanceTypesPage.navigateToInstanceTypesViaUI();
          await instanceTypesPage.waitForInstanceTypesListReady();
          await instanceTypesPage.filterByName('u1.');

          await expect
            .poll(() => instanceTypesPage.getFamilyStatusLabelText(DISABLED_FAMILY), {
              message: 'u1 family rows should show shown status after re-enable',
              timeout: utils.TestTimeouts.DEFAULT,
              intervals: [1000, 2000, 3000],
            })
            .toContain(SHOWN_IN_SELECTORS_LABEL);
        });
      } finally {
        await restoreDisabledFamilies(apiClient, namespace, originalFamilies);
      }
    });

    test('Disabled instance type families are hidden in the VM wizard compute step', async ({
      apiClient,
      instanceTypesPage,
      vmListPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      vmWizardNavigationPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

      const namespace = utils.EnvVariables.cnvNamespace;
      const wizardNamespace = await setupTestNamespace(apiClient, 'family-availability');
      const originalFamilies = await getDisabledInstanceTypeFamilies(apiClient, namespace);

      try {
        await setDisabledInstanceTypeFamilies(
          apiClient,
          namespace,
          originalFamilies.filter((family) => family !== DISABLED_FAMILY),
        );

        await instanceTypesPage.navigateToInstanceTypesViaUI();
        await instanceTypesPage.setFamilyAvailable(DISABLED_FAMILY, false);

        await expect
          .poll(() => getDisabledInstanceTypeFamilies(apiClient, namespace), {
            message: `${DISABLED_FAMILY} should be disabled before opening the wizard`,
            timeout: utils.TestTimeouts.DEFAULT,
            intervals: [1000, 2000, 3000],
          })
          .toContain(DISABLED_FAMILY);

        await navigateWizardToComputeStep({
          namespace: wizardNamespace,
          skipBootSource: true,
          vmListPage,
          vmWizardBootSourcePage,
          vmWizardComputePage,
          vmWizardNavigationPage,
        });

        const uSeriesVisible = await vmWizardComputePage.isInstanceTypeSeriesCardVisible('u');
        expect(uSeriesVisible, 'General Purpose (u1) series should be hidden when disabled').toBe(
          false,
        );

        const mSeriesVisible = await vmWizardComputePage.isInstanceTypeSeriesCardVisible('m');
        expect(mSeriesVisible, 'At least one other series should remain visible').toBe(true);
      } finally {
        await restoreDisabledFamilies(apiClient, namespace, originalFamilies);
      }
    });
  },
);
