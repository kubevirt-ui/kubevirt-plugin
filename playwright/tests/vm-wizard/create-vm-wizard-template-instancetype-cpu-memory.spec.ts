import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { createNamespacedInstanceTypeApi } from '@/utils/instance-type-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Template catalog instance type CPU and memory',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('shows CPU and memory from a namespaced instance type, not stale domain values', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@CNV-100179'],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-it-cpu-mem');
      const templateName = utils.generateRandomTemplateName('tpl-it');
      const instanceTypeName = utils.generateRandomName('pw-user-it');

      await createNamespacedInstanceTypeApi(apiClient, instanceTypeName, wizardNs, 4, '8Gi');

      const templateResource = utils.TemplateFactory.createResourceObject({
        cpuCores: 1,
        memory: '512Mi',
        name: templateName,
        namespace: wizardNs,
      });
      const vmObject = (templateResource.objects as KubernetesResource[])[0] as {
        spec?: Record<string, unknown>;
      };
      vmObject.spec = {
        ...(vmObject.spec ?? {}),
        instancetype: {
          kind: 'VirtualMachineInstancetype',
          name: instanceTypeName,
          namespace: wizardNs,
        },
      };

      await apiClient.createTemplate(wizardNs, templateResource);
      apiClient.trackResource('Template', templateName, wizardNs);

      const templateReady = await apiClient.verifyTemplateCreated(templateName, wizardNs);
      expect(templateReady.exists, `Template '${templateName}' should exist before wizard`).toBe(true);

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToNamespaceVirtualMachines(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      expect(await vmWizardNavigationPage.verifyWizardVisible(), 'Wizard should open').toBe(true);

      await test.step('Open template catalog for the test project', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();

        expect(
          await vmWizardNavigationPage.verifyTemplateCatalogStepVisible(),
          'Template catalog should be visible',
        ).toBe(true);

        await vmWizardNavigationPage.selectTemplateCatalogProject(wizardNs);
        await vmWizardNavigationPage.selectUserTemplatesScopeFilter();
        await vmWizardNavigationPage.filterTemplateCatalog(templateName);
        await vmWizardNavigationPage.toggleTemplateCatalogView('list');
      });

      await test.step('CPU | Memory column reflects the namespaced instance type', async () => {
        await expect
          .poll(() => vmWizardNavigationPage.getTemplateCatalogCpuMemoryText(templateName), {
            message: 'Catalog should show instance type sizing',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toMatch(/4.*CPU.*8\s*GiB/i);
      });
    });
  },
);
