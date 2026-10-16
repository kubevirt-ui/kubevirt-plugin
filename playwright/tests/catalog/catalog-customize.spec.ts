import { NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { CatalogReviewTabTestId, TEMPLATE_RHEL9 } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { generateCatalogNetworkVmName } from '@/utils/network-test-data';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Catalog customize read ${ROUTE_CATALOG_TAG} ${T1_TAG}`, () => {
  test('Selecting a template exposes customize VM action', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
    await expect(catalogPage.customizeButton()).toBeVisible();
  });
});

test.describe(`Catalog customize create basic ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Customize VM name on catalog, review, and create', async ({
    page,
    catalogPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('pw-cat-custom').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await dismissConsoleObstructions(page);
      await catalogPage.startCustomizeFlow(TEMPLATE_RHEL9.metadataName, vmName);

      await expect(page.getByText(vmName, { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await catalogPage.createVirtualMachineFromReview();
      await expect(page).toHaveURL(new RegExp(`VirtualMachine/${vmName}`), {
        timeout: TestTimeouts.LONG_OPERATION,
      });

      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Catalog customize network interfaces ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Review wizard network tab shows template NIC and add modal', async ({
    catalogPage,
    vmNetworkInterfacesPage: networks,
    vmDetailPage,
    testNamespace,
  }) => {
    const vmName = generateCatalogNetworkVmName('pw-net-read');

    await catalogPage.openCatalogPrepared(testNamespace);
    await catalogPage.startCustomizeFlowOnReviewNetworksTab(TEMPLATE_RHEL9.metadataName, vmName);
    await networks.waitForNetworkTabReady();
    await networks.expectDefaultPodNetworkInterfaceVisible();
    await networks.openAddNetworkInterfaceModal();
    await networks.expectWizardModelSelectVisible();
    await networks.cancelNetworkInterfaceModal();
    await vmDetailPage.toggleYamlSidebarEditor('networkSpec');
  });
});

test.describe(`Catalog customize wizard ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Walk review wizard tabs after customize and create VM', async ({
    page,
    catalogPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('pw-cat-wizard').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await dismissConsoleObstructions(page);
      await catalogPage.startCustomizeFlow(TEMPLATE_RHEL9.metadataName, vmName);

      await expect(page.getByText(vmName, { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.YAML);
      await expect(page.getByText('Download', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Scheduling);
      await expect(page.getByText('Node selector', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(page.getByText('Eviction strategy', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Environment);
      await expect(page.getByText('Include all values', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Networks);
      await expect(page.getByText('Pod networking', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Disks);
      await expect(page.getByText('rootdisk', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Scripts);
      await expect(page.getByText('Cloud-init', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Metadata);
      await expect(page.getByText('Labels', { exact: false }).first()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Overview);
      await catalogPage.createVirtualMachineFromReview();
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
