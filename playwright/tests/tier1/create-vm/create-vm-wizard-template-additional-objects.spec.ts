import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Template additional objects',
  { tag: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('creates namespaced additional object in the VM namespace when template omits namespace', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@CNV-97155'],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-addl-obj');
      const templateName = utils.generateRandomTemplateName('tpl-addl');
      const secretName = utils.generateRandomName('tpl-secret');

      const templateResource = utils.TemplateFactory.createResourceObject({
        displayName: 'Template with additional Secret',
        name: templateName,
        namespace: wizardNs,
      });
      const objects = templateResource.objects as KubernetesResource[];
      objects.push({
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName },
        type: 'Opaque',
        data: { key: Buffer.from('value').toString('base64') },
      });

      await apiClient.createTemplate(wizardNs, templateResource);
      apiClient.trackResource('Template', templateName, wizardNs);
      apiClient.trackResource('Secret', secretName, wizardNs);

      const templateReady = await apiClient.verifyTemplateCreated(templateName, wizardNs);
      expect(templateReady.exists, `Template '${templateName}' should exist before wizard`).toBe(
        true,
      );

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToNamespaceVirtualMachines(wizardNs);
      await vmListPage.clickVmListTab();
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
      expect(wizardVisible, 'Wizard should open').toBe(true);

      await test.step('Step 1: Deployment details — select From Template', async () => {
        await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Template catalog — select custom template', async () => {
        const catalogVisible = await vmWizardNavigationPage.verifyTemplateCatalogStepVisible();
        expect(catalogVisible, 'Template catalog should be visible').toBe(true);

        await vmWizardNavigationPage.selectTemplateCatalogProject(wizardNs);
        await vmWizardNavigationPage.selectUserTemplatesScopeFilter();
        await vmWizardNavigationPage.filterTemplateCatalog(templateName);
        await vmWizardNavigationPage.selectTemplateByTestId(templateName);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Customization — proceed with defaults', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect(custVisible, 'Customization step should be visible').toBe(true);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Review and create VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);
        await vmWizardNavigationPage.clickCreateVm();

        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);
      });

      await test.step('Verify VM and additional Secret were created in the VM namespace', async () => {
        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        apiClient.trackResource('VirtualMachine', vmName, wizardNs);

        const vmResult = await apiClient.verifyVmCreated(vmName, wizardNs);
        expect(vmResult.exists, `VM '${vmName}' should exist`).toBe(true);

        const secretExists = await apiClient.secretExists(wizardNs, secretName);
        expect(secretExists, `Secret '${secretName}' should exist in namespace '${wizardNs}'`).toBe(
          true,
        );

        const secret = await apiClient.getResourceByKind('secret', secretName, wizardNs);
        expect(secret?.metadata?.namespace, 'Secret should be created in the VM namespace').toBe(
          wizardNs,
        );
      });
    });
  },
);
