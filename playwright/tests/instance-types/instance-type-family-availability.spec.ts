import type RequestContextClient from '@/clients/request-context-client';
import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import type VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';
import type VmWizardBootSourcePage from '@/page-objects/vm-wizard/vm-wizard-boot-source-page';
import type VmWizardComputeCustomizationPage from '@/page-objects/vm-wizard/vm-wizard-compute-customization-page';
import type VmWizardNavigationPage from '@/page-objects/vm-wizard/vm-wizard-navigation-page';
import { EnvVariables } from '@/utils/env-variables';
import {
  getDisabledInstanceTypeFamilies,
  setDisabledInstanceTypeFamilies,
} from '@/utils/instance-type-test-helpers';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Instance type family availability';
const DISABLED_FAMILY = 'u1';
const ALL_INSTANCE_TYPE_FAMILIES = ['u1', 'm1', 'cx1', 'd1', 'n1', 'o1', 'rt1'];
const HIDDEN_FROM_SELECTORS_LABEL = 'Hidden from selectors';
const SHOWN_IN_SELECTORS_LABEL = 'Shown in selectors';
const INSTANCE_TYPE_VENDOR_LABEL = 'instancetype.kubevirt.io/vendor';
const RED_HAT_INSTANCE_TYPE_VENDORS = new Set(['kubevirt.io', 'redhat.com']);

const sortFamilies = (families: string[]): string[] =>
  [...new Set(families)].sort((a, b) => a.localeCompare(b));

/** Returns distinct Red Hat-provided series names present as cluster instance types. */
async function getInstalledRedHatSeriesNames(apiClient: RequestContextClient): Promise<string[]> {
  const list = await apiClient.getVirtualMachineClusterInstanceTypes();
  const series = new Set<string>();

  for (const item of list?.items ?? []) {
    const metadata = item.metadata as
      | { labels?: Record<string, string>; name?: string }
      | undefined;
    const vendor = metadata?.labels?.[INSTANCE_TYPE_VENDOR_LABEL];
    if (!vendor || !RED_HAT_INSTANCE_TYPE_VENDORS.has(vendor)) {
      continue;
    }
    const prefix = metadata?.name?.split('.')[0];
    if (prefix) {
      series.add(prefix);
    }
  }

  return sortFamilies([...series]);
}

/** Enables all families by clearing disabledInstanceTypeFamilies in kubevirt-ui-features. */
async function enableAllInstanceTypeFamilies(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<void> {
  await setDisabledInstanceTypeFamilies(apiClient, namespace, []);
  await expect
    .poll(async () => sortFamilies(await getDisabledInstanceTypeFamilies(apiClient, namespace)), {
      message: 'All instance type families should be enabled',
      timeout: TestTimeouts.DEFAULT,
      intervals: [1000, 2000, 3000],
    })
    .toEqual([]);
}

/** Restores a previously saved disabledInstanceTypeFamilies value. */
async function restoreDisabledFamilies(
  apiClient: RequestContextClient,
  namespace: string,
  families: string[],
): Promise<void> {
  await setDisabledInstanceTypeFamilies(apiClient, namespace, families);
  await expect
    .poll(async () => sortFamilies(await getDisabledInstanceTypeFamilies(apiClient, namespace)), {
      message: 'Disabled instance type families should be restored after the suite',
      timeout: TestTimeouts.DEFAULT,
      intervals: [1000, 2000, 3000],
    })
    .toEqual(sortFamilies(families));
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
  await vmListPage.navigateToNamespaceVirtualMachinesViaUI(namespace);
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
  { tag: [ROUTE_INSTANCE_TYPES_TAG, T2_TAG, '@tier2-pages-it', ADMIN_ONLY_TAG] },
  () => {
    test.skip(EnvVariables.isNonPrivUser, 'Requires cluster admin');

    let originalDisabledFamilies: string[] = [];
    let didCaptureOriginalDisabledFamilies = false;

    test.beforeAll(async ({ apiClient, utils }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        return;
      }
      originalDisabledFamilies = await getDisabledInstanceTypeFamilies(
        apiClient,
        utils.EnvVariables.cnvNamespace,
      );
      didCaptureOriginalDisabledFamilies = true;
    });

    // Enable all families before each test so shared hot-cluster ConfigMap pollution
    // (or a prior test that disabled families) cannot leak into the next scenario.
    test.beforeEach(async ({ apiClient, utils }) => {
      if (utils.EnvVariables.isNonPrivUser) {
        return;
      }
      await enableAllInstanceTypeFamilies(apiClient, utils.EnvVariables.cnvNamespace);
    });

    test.afterAll(async ({ apiClient, utils }) => {
      if (utils.EnvVariables.isNonPrivUser || !didCaptureOriginalDisabledFamilies) {
        return;
      }
      await restoreDisabledFamilies(
        apiClient,
        utils.EnvVariables.cnvNamespace,
        originalDisabledFamilies,
      );
    });

    test('Cluster admins can manage family availability on the InstanceTypes page', async ({
      apiClient,
      instanceTypesPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

      const namespace = utils.EnvVariables.cnvNamespace;

      await instanceTypesPage.navigateToInstanceTypesViaUI();
      await instanceTypesPage.waitForInstanceTypesListReady();

      await test.step('Family availability section is visible to cluster admins', async () => {
        const sectionVisible = await instanceTypesPage.isFamilyAvailabilitySectionVisible();
        expect(sectionVisible, 'Family availability section should be visible').toBe(true);

        await instanceTypesPage.expandFamilyAvailabilitySection();
        const cardVisible =
          await instanceTypesPage.isFamilyAvailabilityCardVisible(DISABLED_FAMILY);
        expect(cardVisible, `${DISABLED_FAMILY} availability card should be visible`).toBe(true);
      });

      await test.step('Disabling a family updates the features ConfigMap', async () => {
        await instanceTypesPage.setFamilyAvailable(DISABLED_FAMILY, false);

        await expect
          .poll(
            async () => sortFamilies(await getDisabledInstanceTypeFamilies(apiClient, namespace)),
            {
              message: `Only ${DISABLED_FAMILY} should be listed as disabled in kubevirt-ui-features`,
              timeout: utils.TestTimeouts.DEFAULT,
              intervals: [1000, 2000, 3000],
            },
          )
          .toEqual([DISABLED_FAMILY]);
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
        feature: T2,
        tags: [T2_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

      const namespace = utils.EnvVariables.cnvNamespace;
      const wizardNamespace = await setupTestNamespace(apiClient, 'family-availability');

      await instanceTypesPage.navigateToInstanceTypesViaUI();
      await instanceTypesPage.setFamilyAvailable(DISABLED_FAMILY, false);

      await expect
        .poll(
          async () => sortFamilies(await getDisabledInstanceTypeFamilies(apiClient, namespace)),
          {
            message: `Only ${DISABLED_FAMILY} should be disabled before opening the wizard`,
            timeout: utils.TestTimeouts.DEFAULT,
            intervals: [1000, 2000, 3000],
          },
        )
        .toEqual([DISABLED_FAMILY]);

      await navigateWizardToComputeStep({
        namespace: wizardNamespace,
        skipBootSource: true,
        vmListPage,
        vmWizardBootSourcePage,
        vmWizardComputePage,
        vmWizardNavigationPage,
      });

      await expect
        .poll(() => vmWizardComputePage.isInstanceTypeSeriesCardVisible('m'), {
          message: 'Compute step should finish loading instance type series',
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [500, 1000, 2000],
        })
        .toBe(true);

      const uSeriesVisible = await vmWizardComputePage.isInstanceTypeSeriesCardVisible('u');
      expect(uSeriesVisible, 'General Purpose (u1) series should be hidden when disabled').toBe(
        false,
      );
    });

    test('All disabled instance type families show an empty state in the VM wizard', async ({
      apiClient,
      vmListPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      vmWizardNavigationPage,
      utils,
      page,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

      const namespace = utils.EnvVariables.cnvNamespace;
      const wizardNamespace = await setupTestNamespace(apiClient, 'family-availability-empty');

      const installedRedHatSeries = await getInstalledRedHatSeriesNames(apiClient);
      expect(
        installedRedHatSeries.length,
        'Catalog should include at least one Red Hat-provided series',
      ).toBeGreaterThan(0);
      const unexpectedSeries = installedRedHatSeries.filter(
        (series) => !ALL_INSTANCE_TYPE_FAMILIES.includes(series),
      );
      expect(
        unexpectedSeries,
        `Catalog has Red Hat series outside the known family list: ${unexpectedSeries.join(', ')}`,
      ).toEqual([]);

      await setDisabledInstanceTypeFamilies(apiClient, namespace, ALL_INSTANCE_TYPE_FAMILIES);

      await expect
        .poll(
          async () => sortFamilies(await getDisabledInstanceTypeFamilies(apiClient, namespace)),
          {
            message: 'All instance type families should be disabled before opening the wizard',
            timeout: utils.TestTimeouts.DEFAULT,
            intervals: [1000, 2000, 3000],
          },
        )
        .toEqual(sortFamilies(ALL_INSTANCE_TYPE_FAMILIES));

      await navigateWizardToComputeStep({
        namespace: wizardNamespace,
        skipBootSource: true,
        vmListPage,
        vmWizardBootSourcePage,
        vmWizardComputePage,
        vmWizardNavigationPage,
      });

      await expect(
        page.getByRole('heading', { name: 'No compute resources available' }),
      ).toBeVisible({ timeout: utils.TestTimeouts.DEFAULT });
      await expect(page.getByTestId('manage-family-availability')).toBeVisible();

      for (const series of ['u', 'm', 'cx', 'd', 'n', 'o', 'rt'] as const) {
        const visible = await vmWizardComputePage.isInstanceTypeSeriesCardVisible(series);
        expect(visible, `${series}1 series card should be hidden`).toBe(false);
      }
    });
  },
);
