import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/checkups-fixture';

const SUITE = 'Checkups page';

test.describe(SUITE, { tag: [T1_TAG, '@tier1-pages-checkups'] }, () => {
  test.beforeEach(async ({ k8sClient, overviewPage, testConfig, utils }) => {
    const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;

    await k8sClient.ensureNetworkCheckupPermissions(namespace);
    await k8sClient.ensureStorageCheckupPermissions(namespace);

    await overviewPage.navigateToCheckupsViaUI();
  });

  test.describe('Network latency', () => {
    test('Network latency checkup lifecycle', async ({
      k8sClient,
      checkupsPage,
      pageCommons,
      testConfig,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });

      const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;
      const nadName = utils.generateRandomNadName('latency-nad');

      await k8sClient.ensureOvnNadExists(nadName, namespace);

      await checkupsPage.navigateToProjectNetworkCheckupsViaUI(namespace);
      await checkupsPage.installPermissionsIfNeeded();

      const runClickable = await checkupsPage.isRunCheckupButtonClickable();
      if (!runClickable) {
        return;
      }

      await checkupsPage.clickRunCheckup();

      await checkupsPage.selectNad(nadName);

      const netLatencyName = utils.generateRandomCheckupName('network-latency');
      await checkupsPage.setCheckupName(netLatencyName);

      await checkupsPage.clickRun();

      const runningExists = await checkupsPage.verifyCheckupRunning(netLatencyName);
      expect
        .soft(runningExists, 'Network latency checkup should be running or completed')
        .toBe(true);

      await checkupsPage.clickCheckup(netLatencyName);

      const subtitleExists = await checkupsPage.verifySubtitle('Network latency checkup details');
      expect
        .soft(subtitleExists, 'Network latency checkup details subtitle should be visible')
        .toBe(true);

      const namespaceLinkExists = await checkupsPage.verifyLinkExists(namespace);
      expect.soft(namespaceLinkExists, 'Namespace link should exist').toBe(true);

      await checkupsPage.clickNetworkLatencyCheckup();

      const runningAgain = await checkupsPage.verifyCheckupRunning(netLatencyName);
      expect
        .soft(runningAgain, 'Network latency checkup should be running or completed in list')
        .toBe(true);

      await checkupsPage.clickCheckup(netLatencyName);
      await checkupsPage.clickCheckupActions();
      await pageCommons.clickDeleteButton();
      await checkupsPage.clickFooterDelete();

      const checkupNotExists = await checkupsPage.verifyCheckupDeleted(netLatencyName);
      expect.soft(checkupNotExists, 'Network latency checkup should be deleted').toBe(true);
    });
  });

  test.describe('Storage', () => {
    test('Storage checkup lifecycle', async ({ checkupsPage, pageCommons, testConfig, utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });

      const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;

      await checkupsPage.navigateToProjectStorageCheckupsViaUI(namespace);
      await checkupsPage.installPermissionsIfNeeded();

      const runClickable = await checkupsPage.isRunCheckupButtonClickable();
      if (!runClickable) {
        return;
      }

      await checkupsPage.clickRunCheckup();

      const storageCheckupName = utils.generateRandomCheckupName('storage');
      await checkupsPage.setCheckupName(storageCheckupName);

      await checkupsPage.clickRun();

      const runningExists = await checkupsPage.verifyCheckupRunning(storageCheckupName);
      expect.soft(runningExists, 'Storage checkup should be running or completed').toBe(true);

      await checkupsPage.clickCheckup(storageCheckupName);

      const subtitleExists = await checkupsPage.verifySubtitle('Storage checkup details');
      expect.soft(subtitleExists, 'Storage checkup details subtitle should be visible').toBe(true);

      const namespaceLinkExists = await checkupsPage.verifyLinkExists(namespace);
      expect.soft(namespaceLinkExists, 'Namespace link should exist on detail page').toBe(true);

      await checkupsPage.clickStorageCheckup();

      const runningAgain = await checkupsPage.verifyCheckupRunning(storageCheckupName);
      expect
        .soft(runningAgain, 'Storage checkup should be running or completed in list')
        .toBe(true);

      await checkupsPage.clickCheckup(storageCheckupName);
      await checkupsPage.clickCheckupActions();
      await pageCommons.clickDeleteButton();
      await checkupsPage.clickFooterDelete();

      const checkupNotExists = await checkupsPage.verifyCheckupDeleted(storageCheckupName);
      expect.soft(checkupNotExists, 'Storage checkup should be deleted').toBe(true);
    });
  });
});
