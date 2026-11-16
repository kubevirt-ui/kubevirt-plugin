import { T2_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-wizard-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { TestTimeouts } from '@/utils/test-config';

const RHEL9_TEMPLATE = TEMPLATE_METADATA_NAMES.RHEL9;
const RHEL9_TILE = new RegExp(
  `${RHEL9_TEMPLATE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|Red Hat Enterprise Linux 9`,
  'i',
);

/**
 * Template-catalog filter coverage on `/vm-wizard` (catalog route removed in 4.23).
 * Uses EnvVariables.isS390x for arch-conditioned expectations — no s390x-only suite.
 */
test.describe(
  `VM wizard template filters ${ROUTE_VM_WIZARD_TAG} ${T2_TAG} ${NON_PRIV_TAG}`,
  () => {
    test.beforeEach(async ({ testNamespace, vmCreationWizardPage, vmListPage }) => {
      await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
      await vmCreationWizardPage.openFromTemplateCatalogStep();
    });

    test('Template catalog toolbar, cards, and keyword filter are available', async ({
      vmCreationWizardPage,
    }) => {
      // The catalog hydrates after the step heading; poll instead of sampling the count once.
      await expect
        .poll(() => vmCreationWizardPage.getTemplateCatalogCount(), {
          message: 'At least one template card should be visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        })
        .toBeGreaterThan(0);
      const unfilteredCount = await vmCreationWizardPage.getTemplateCatalogCount();
      await expect(vmCreationWizardPage.templateCatalogTileMatching(RHEL9_TILE)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      if (EnvVariables.isS390x) {
        expect(RHEL9_TEMPLATE, 'RHEL9 template metadata should be s390x-suffixed').toContain(
          's390x',
        );
        expect(
          await vmCreationWizardPage.verifyArchitectureFilterExists(),
          'Architecture filter should be present on s390x',
        ).toBe(true);
      }

      await vmCreationWizardPage.filterTemplateCatalog(RHEL9_TEMPLATE);
      await expect(vmCreationWizardPage.templateCatalogTileMatching(RHEL9_TILE)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      const filteredCount = await vmCreationWizardPage.getTemplateCatalogCount();
      expect(filteredCount, 'Keyword filter should narrow the catalog').toBeLessThanOrEqual(
        unfilteredCount,
      );
    });

    test('ID(CNV-8464) Filter wizard template catalog by OS name', async ({
      vmCreationWizardPage,
    }) => {
      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-RHEL', true);
      await expect(vmCreationWizardPage.templateCatalogTileMatching(RHEL9_TILE)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await expect(
        vmCreationWizardPage.templateCatalogTileMatching(
          /rhel8-server-small|Red Hat Enterprise Linux 8/i,
        ),
      ).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-RHEL', false);

      // Desktop Windows tiles are not published on s390x.
      if (!EnvVariables.isS390x) {
        await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', true);
        await expect(
          vmCreationWizardPage.templateCatalogTileMatching(/windows10|Microsoft Windows 10/i),
        ).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
        await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', false);
      } else {
        await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', true);
        await expect(
          vmCreationWizardPage.templateCatalogTiles().filter({ hasText: /Windows/i }),
        ).toHaveCount(0);
        await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', false);
      }

      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Fedora', true);
      await expect(vmCreationWizardPage.templateCatalogTileMatching(/fedora/i)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Fedora', false);
    });

    test('ID(CNV-8467) Filter wizard template catalog by text', async ({
      vmCreationWizardPage,
    }) => {
      await vmCreationWizardPage.filterTemplateCatalog(RHEL9_TEMPLATE);
      await expect(vmCreationWizardPage.templateCatalogTileMatching(RHEL9_TILE)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      expect(await vmCreationWizardPage.getTemplateCatalogCount()).toBe(1);
    });

    test('ID(CNV-8465/CNV-8466) Filter wizard template catalog by workload keyword and OS', async ({
      vmCreationWizardPage,
    }) => {
      await vmCreationWizardPage.filterTemplateCatalog('server');
      await expect(vmCreationWizardPage.templateCatalogTileMatching(/server/i)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });

      if (EnvVariables.isS390x) {
        // Windows server templates are not published on s390x.
        return;
      }

      await vmCreationWizardPage.filterTemplateCatalog('');
      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', true);
      await vmCreationWizardPage.filterTemplateCatalog('server');
      await expect(
        vmCreationWizardPage.templateCatalogTileMatching(
          /windows2k22|windows2k19|windows2k16/i,
        ),
      ).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
      await vmCreationWizardPage.filterTemplateCatalogByOsCheckbox('osName-Windows', false);
    });

    test('Selecting a template enables Next toward customization', async ({
      vmCreationWizardPage,
    }) => {
      await vmCreationWizardPage.selectTemplateByMetadataName(RHEL9_TEMPLATE);
      const nextDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(nextDisabled, 'Next should be enabled after selecting a template').toBe(false);
    });
  },
);
