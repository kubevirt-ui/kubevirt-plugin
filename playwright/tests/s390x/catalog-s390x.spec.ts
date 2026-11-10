/**
 * s390x — Template catalog architecture-specific behaviour (kubevirt-ui parity).
 *
 * Modes: real s390x (`ARCH=s390x`), mock (`S390X_MOCK_ENABLED=1`), otherwise skip.
 */
import { S390X_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/s390x-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';

test.beforeAll(() => {
  if (!EnvVariables.isS390x && !EnvVariables.s390xMockEnabled) test.skip();
});

test.describe(`s390x Template Catalog ${S390X_TAG}`, () => {
  test('Architecture filter in catalog shows s390x checkboxes', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    const archFilterExists = await catalogPage.verifyArchitectureFilterExists();
    expect(archFilterExists, 'Architecture filter should exist in catalog on s390x').toBe(true);
  });

  test('Templates catalog does not show Windows templates on s390x', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    await catalogPage.filterByOsCheckbox('osName-Windows', true);
    await expect(catalogPage.gridLinkWithText(/Windows/i)).toHaveCount(0);
    await catalogPage.filterByOsCheckbox('osName-Windows', false);
  });

  test('Templates catalog OS filter for RHEL shows s390x-compatible templates', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    await catalogPage.filterByOsCheckbox('osName-RHEL', true);
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 9 VM')).toBeVisible();
    await catalogPage.filterByOsCheckbox('osName-RHEL', false);
  });

  test('Templates list resolves RHEL9 metadata name with s390x suffix when applicable', async () => {
    if (!EnvVariables.isS390x) {
      test.skip(true, 'Suffix assertion requires real s390x ARCH detection');
    }
    expect(TEMPLATE_METADATA_NAMES.RHEL9).toContain('s390x');
  });
});
