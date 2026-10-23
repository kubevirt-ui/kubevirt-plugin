import { NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
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
    await expect(catalogPage.legacyQuickCreateModalHeading()).toBeVisible();
    await expect(catalogPage.customizeVirtualMachineButton()).toBeVisible();
  });
});

test.describe(`Catalog customize create basic ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Customize VM name on catalog, review, and create', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('pw-cat-custom').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.dismissConsoleObstructions();
      await catalogPage.startCustomizeFlow(TEMPLATE_RHEL9.metadataName, vmName);
      await expect(catalogPage.reviewVisibleText(vmName)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await catalogPage.createVirtualMachineFromReview();
      await expect
        .poll(() => catalogPage.currentUrl())
        .toMatch(catalogPage.virtualMachineDetailUrlPattern(vmName));

      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Catalog customize network interfaces ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Review wizard network tab shows template NIC and add modal', async ({
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmNetworkInterfacesPage: networks,
  }) => {
    const vmName = generateCatalogNetworkVmName('pw-net-read');

    await catalogPage.openCatalogPrepared(testNamespace);
    await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
    await catalogPage.fillCustomizeVmName(vmName);
    await catalogPage.openCustomizeWizard();
    if (
      !(await catalogPage
        .reviewWizardReady()
        .isVisible()
        .catch(() => false))
    ) {
      await catalogPage.submitCustomizeToReview();
    }
    if (
      !(await catalogPage
        .reviewWizardReady()
        .isVisible()
        .catch(() => false))
    ) {
      await expect(catalogPage.legacyQuickCreateModalHeading()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(catalogPage.legacyVmNameTextbox()).toBeVisible();
      return;
    }
    await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Networks);
    await networks.waitForNetworkTabReady();
    await expect(networks.nicNameCell('default')).toBeVisible();
    await expect(networks.podNetworkingCell()).toBeVisible();
    await networks.openAddNetworkInterfaceModal();
    await expect(networks.wizardModelSelect()).toBeVisible();
    await networks.cancelNetworkInterfaceModal();
    await vmDetailPage.toggleYamlSidebarEditor('networkSpec');
  });
});

test.describe(`Catalog customize wizard ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Walk review wizard tabs after customize and create VM', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('pw-cat-wizard').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.dismissConsoleObstructions();
      if (catalogPage.isLegacyTemplatesCatalogRoute()) {
        await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
        await catalogPage.fillCustomizeVmName(vmName);
        await catalogPage.completeLegacyQuickCreateModal(vmName);
        await expect
          .poll(() => catalogPage.currentUrl())
          .toMatch(catalogPage.virtualMachineDetailUrlPattern(vmName));
        await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
        return;
      }
      await catalogPage.startCustomizeFlow(TEMPLATE_RHEL9.metadataName, vmName);

      await expect(catalogPage.reviewVisibleText(vmName)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.YAML);
      await expect(catalogPage.reviewVisibleText('Download')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Scheduling);
      await expect(catalogPage.reviewVisibleText('Node selector')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(catalogPage.reviewVisibleText('Eviction strategy')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Environment);
      await expect(catalogPage.reviewVisibleText('Include all values')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Networks);
      await expect(catalogPage.reviewVisibleText('Pod networking')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Disks);
      await expect(catalogPage.reviewVisibleText('rootdisk')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Scripts);
      await expect(catalogPage.reviewVisibleText('Cloud-init')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      await catalogPage.goToReviewWizardTab(CatalogReviewTabTestId.Metadata);
      await expect(catalogPage.reviewVisibleText('Labels')).toBeVisible({
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
