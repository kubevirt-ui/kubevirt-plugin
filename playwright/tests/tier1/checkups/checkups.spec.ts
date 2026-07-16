import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/checkups-fixture';

const SUITE = 'Checkups page';

test.describe(SUITE, { tag: [T1_TAG, '@tier1-pages-checkups'] }, () => {
  test.beforeEach(async ({ overviewPage }) => {
    await overviewPage.navigateToCheckupsViaUI();
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
      test.skip(
        !runClickable,
        'Run checkup button is not clickable — checkup operator may not be ready',
      );

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
