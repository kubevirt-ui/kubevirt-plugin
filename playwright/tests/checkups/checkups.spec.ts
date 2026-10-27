import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_CHECKUPS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/checkups-fixture';
import {
  generateNetworkAttachmentDefinitionName,
  provisionNetworkAttachmentDefinition,
  teardownNetworkAttachmentDefinition,
} from '@/utils/network-test-data';
import { generateRandomCheckupName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Checkups gating page load ${ROUTE_CHECKUPS_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Checkups page shows Network latency and Storage tabs with storage affordance', async ({
    checkupsPage,
    nav,
    testNamespace,
  }) => {
    await nav.goToCheckups(testNamespace);

    await expect(checkupsPage.page.getByRole('tab', { name: /Network latency/i })).toBeVisible();
    await expect(checkupsPage.page.getByRole('tab', { name: /^Storage$/i })).toBeVisible();

    await checkupsPage.clickStorageTab();
    const needsInstall = await checkupsPage.isInstallPermissionsVisible();
    const canRun = await checkupsPage.isTabPanelRunCheckupEnabled();
    expect
      .soft(
        needsInstall || canRun,
        'Storage tab should show Install permissions or an enabled Run checkup',
      )
      .toBe(true);
  });
});

test.describe(`Storage checkup lifecycle ${ROUTE_CHECKUPS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Storage checkup lifecycle', async ({ apiClient, checkupsPage, testNamespace }) => {
    await checkupsPage.goToStorageList(testNamespace);
    await checkupsPage.installPermissionsIfNeeded();

    if (!(await checkupsPage.isTabPanelRunCheckupEnabled())) {
      test.skip(true, 'Run checkup is disabled — storage checkup prerequisites may be missing');
    }

    const checkupName = generateRandomCheckupName('storage');
    await checkupsPage.goToStorageForm(testNamespace);
    await checkupsPage.setCheckupName(checkupName);
    await checkupsPage.setStorageTimeoutMinutes('30');
    await checkupsPage.clickFormRun();
    await checkupsPage.page.waitForURL(/\/checkups\/storage(?:\/|$)/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });

    await expect
      .poll(() => checkupsPage.verifyCheckupInList(checkupName), {
        message: 'Storage checkup should appear in list',
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(true);

    await checkupsPage.clickCheckupLink(checkupName);
    await expect(
      checkupsPage.page.getByRole('heading', { name: 'Storage checkup details' }),
    ).toBeVisible();
    await expect(
      checkupsPage.page.getByRole('link', { name: testNamespace }).first(),
    ).toBeVisible();

    await checkupsPage.clickStorageCheckupBreadcrumb();
    await expect(checkupsPage.page.getByRole('link', { name: checkupName })).toBeVisible();

    await checkupsPage.clickCheckupLink(checkupName);
    await checkupsPage.deleteFromActionsMenu();
    await checkupsPage.goToStorageList(testNamespace);
    await expect(checkupsPage.page.getByRole('link', { name: checkupName })).toBeHidden({
      timeout: TestTimeouts.LONG_OPERATION,
    });

    await apiClient.deleteConfigMap(checkupName, testNamespace).catch(() => undefined);
  });
});

test.describe(`Network latency checkup lifecycle ${ROUTE_CHECKUPS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Network latency checkup lifecycle', async ({ apiClient, checkupsPage, testNamespace }) => {
    const nadName = generateNetworkAttachmentDefinitionName();
    await provisionNetworkAttachmentDefinition(apiClient, testNamespace, nadName);

    try {
      await checkupsPage.goToNetworkList(testNamespace);
      await checkupsPage.installPermissionsIfNeeded();

      const checkupName = generateRandomCheckupName('network');
      await checkupsPage.goToNetworkForm(testNamespace);
      await checkupsPage.setCheckupName(checkupName);
      const nadField = checkupsPage.page.getByRole('textbox', {
        name: /Select NetwrokAttachmentDefinition/i,
      });
      await expect
        .poll(
          async () => {
            if ((await nadField.inputValue().catch(() => '')) === nadName) {
              return true;
            }
            await checkupsPage.selectNetworkAttachmentDefinition(nadName).catch(() => undefined);
            return (await nadField.inputValue().catch(() => '')) === nadName;
          },
          {
            message: `NAD ${nadName} should appear in checkup form`,
            timeout: TestTimeouts.TEST_SHORT,
          },
        )
        .toBe(true);
      await checkupsPage.clickFormRun();
      await checkupsPage.page.waitForURL(/\/checkups(?:\/|$)/, {
        timeout: TestTimeouts.LONG_OPERATION,
      });

      await expect
        .poll(() => checkupsPage.verifyCheckupInList(checkupName), {
          message: 'Network checkup should appear in list',
          timeout: TestTimeouts.TEST_VM_CREATION,
        })
        .toBe(true);

      await checkupsPage.clickCheckupLink(checkupName);
      await expect(
        checkupsPage.page.getByRole('heading', { name: 'Latency checkup details' }),
      ).toBeVisible();
      await expect(
        checkupsPage.page.getByRole('link', { name: testNamespace }).first(),
      ).toBeVisible();

      await checkupsPage.deleteFromActionsMenu();
      await checkupsPage.goToNetworkList(testNamespace);
      await expect(checkupsPage.page.getByRole('link', { name: checkupName })).toBeHidden({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await teardownNetworkAttachmentDefinition(apiClient, testNamespace, nadName);
    }
  });
});
