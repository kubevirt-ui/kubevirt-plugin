import { T2, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/templates-fixture';
import { setupTemplateFromResource } from '@/utils/template-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Template detail page';

const TEMPLATE_FIELDS = {
  displayName: 'Detail Validation Template',
  description: 'Template created for detail page validation',
  cpuCores: 2,
  memory: '4Gi',
};

test.describe.serial(
  'Template detail page validation',
  { tag: [T2_TAG, '@tier2-templates'] },
  () => {
    let sharedNs: string;
    let templateName: string;

    test.beforeAll(async ({ k8sClient, utils }) => {
      sharedNs = await setupTestNamespace(k8sClient, 'tpl-detail');
      const result = await setupTemplateFromResource(
        k8sClient,
        'detail-tpl',
        {
          targetNamespace: sharedNs,
          ...TEMPLATE_FIELDS,
        },
        utils,
      );
      templateName = result.templateName;

      const exists = await k8sClient.verifyTemplateCreated(templateName, sharedNs);
      if (!exists.exists) {
        throw new Error(`Template ${templateName} was not created`);
      }
    });

    test.beforeEach(async ({ utils }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG, '@tier2-templates'],
      });
    });

    test('Details tab shows correct template metadata', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);

      const isNameVisible = await templateDetailPage.isTemplateNameVisible(templateName);
      expect.soft(isNameVisible, 'Template name should be visible').toBe(true);

      const displayNameVisible = await templateDetailPage.verifyDisplayName();
      expect.soft(displayNameVisible, 'Display name label should be visible').toBe(true);

      const result = await templateDetailPage.verifyAllDetailFields({
        'Display name': TEMPLATE_FIELDS.displayName,
        Description: TEMPLATE_FIELDS.description,
        'CPU | Memory': `${TEMPLATE_FIELDS.cpuCores} CPU | 4 GiB Memory`,
      });

      for (const fail of result.failed) {
        expect
          .soft(false, `Field "${fail.field}": expected "${fail.expected}", got "${fail.actual}"`)
          .toBe(true);
      }
    });

    test('Scheduling tab loads without errors', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);
      await templateDetailPage.navigateToScheduling();

      const tolerationsVisible = await templateDetailPage.verifyTolerations();
      expect.soft(tolerationsVisible, 'Tolerations section should be visible').toBe(true);
    });

    test('Network interfaces tab shows default network', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);
      await templateDetailPage.navigateToNetworks();

      const podNetworkVisible = await templateDetailPage.verifyPodNetworking();
      expect.soft(podNetworkVisible, 'Network interfaces section should be visible').toBe(true);
    });

    test('Disks tab shows rootdisk', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);
      await templateDetailPage.navigateToDisks();

      const rootdiskVisible = await templateDetailPage.verifyRootdisk();
      expect.soft(rootdiskVisible, 'Rootdisk should be visible on the Disks tab').toBe(true);
    });

    test('Scripts tab shows cloud-init section', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);
      await templateDetailPage.navigateToScripts();

      const cloudInitVisible = await templateDetailPage.verifyCloudInit();
      expect
        .soft(cloudInitVisible, 'Cloud-init section should be visible on the Scripts tab')
        .toBe(true);
    });

    test('Parameters tab loads and shows expected parameters', async ({ templateDetailPage }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);
      await templateDetailPage.navigateToParameters();

      const cloudUserPassword = await templateDetailPage.verifyCloudUserPassword();
      expect
        .soft(
          cloudUserPassword,
          'CLOUD_USER_PASSWORD parameter should be visible on the Parameters tab',
        )
        .toBe(true);
    });

    test('Actions dropdown shows Clone and Delete for user templates', async ({
      templateDetailPage,
    }) => {
      await templateDetailPage.navigateToTemplateDetail(templateName, sharedNs);

      await templateDetailPage.clickActionsDropdown();

      const cloneItem = templateDetailPage.page.getByRole('menuitem', { name: 'Clone' });
      const deleteItem = templateDetailPage.page.getByRole('menuitem', { name: 'Delete' });

      await expect
        .soft(cloneItem, 'Clone action should be visible for user templates')
        .toBeVisible();
      await expect
        .soft(deleteItem, 'Delete action should be visible for user templates')
        .toBeVisible();

      await templateDetailPage.page.keyboard.press('Escape');
    });
  },
);
