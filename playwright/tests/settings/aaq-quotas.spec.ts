import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

const AAQ_DOC_URL =
  'https://docs.redhat.com/documentation/openshift_container_platform/latest/html-single/virtualization/index#virt-about-aaq-operator_virt-understanding-aaq-operator';

const SUITE = 'Application Aware Quota';

test.describe('Application Aware Quota', { tag: [CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.navigateToSettingsViaSidebar();
  });

  test('Enabling AAQ from Resource management shows Quotas page with expected content and create options', async ({
    settingsPage,
    quotasPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToResourceManagement();

    const aaqVisible = await settingsPage.isAaqControlVisible();
    expect(aaqVisible, 'AAQ toggle should be visible in Resource management').toBe(true);

    const enabled = await settingsPage.enableAaq();
    expect(enabled, 'AAQ should be enabled').toBe(true);

    await quotasPage.navigateToQuotasViaUI();

    const headingVisible = await quotasPage.verifyPageHeadingVisible();
    expect(headingVisible, 'Page heading "Application-aware quotas" should be visible').toBe(true);

    const linkVisible = await quotasPage.isDocumentationLinkVisible();
    expect(linkVisible, 'Documentation link should be visible').toBe(true);

    const href = await quotasPage.getDocumentationLinkHref();
    expect(href, 'Documentation link should point to Red Hat docs').toBe(AAQ_DOC_URL);

    await test.step('Verify empty state content', async () => {
      const emptyVisible = await quotasPage.verifyEmptyStateVisible();
      expect.soft(emptyVisible, '"No application-aware quotas found" should be visible').toBe(true);

      const guidanceVisible = await quotasPage.verifyEmptyStateGuidanceVisible();
      expect
        .soft(guidanceVisible, 'Guidance text about creating quota should be visible')
        .toBe(true);
    });

    await test.step('Verify Create quota button and dropdown options', async () => {
      const createVisible = await quotasPage.verifyCreateButtonVisible();
      expect.soft(createVisible, 'Create quota button should be visible').toBe(true);

      await quotasPage.clickCreateQuota();
      const options = await quotasPage.verifyCreateDropdownOptions();
      expect.soft(options.withForm, '"With form" option should be available').toBe(true);
      expect.soft(options.withYaml, '"With YAML" option should be available').toBe(true);
    });
  });
});
