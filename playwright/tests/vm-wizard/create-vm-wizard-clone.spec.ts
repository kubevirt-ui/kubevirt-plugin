import { ADMIN_ONLY_TAG, T2, T2_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Clone existing VirtualMachine',
  { tag: [ROUTE_VM_WIZARD_TAG, T2_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Clone wizard submits the expected source, target, and description', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);
      await utils.withAllure({
        suite: SUITE,
        feature: T2,
        tags: [T2_TAG],
      });

      const cloneNs = await utils.setupTestNamespace(apiClient, 'wizard-clone');
      const sourceVmName = utils.generateRandomVmName('clone-src');

      await test.step('Precondition: Create a halted source VM via K8s API', async () => {
        await apiClient.createVmFromTemplate(
          TEMPLATE_METADATA_NAMES.RHEL9,
          sourceVmName,
          cloneNs,
          'openshift',
          false,
        );
        apiClient.trackResource('VirtualMachine', sourceVmName, cloneNs);
      });

      await vmListPage.switchToVirtualizationPerspective();

      await test.step('Step 1: Deployment details — select Clone existing VirtualMachine', async () => {
        await vmListPage.navigateToProjectVmListViaUI(cloneNs);
        await vmWizardNavigationPage.openWizardFromCreateDropdown();

        const wizardVisible = await vmWizardNavigationPage.verifyWizardVisible();
        expect(wizardVisible, 'Wizard should open').toBe(true);

        await vmWizardNavigationPage.selectCreationMethod('cloneVm');

        const isCloneSelected =
          await vmWizardNavigationPage.verifyCreationMethodCardSelected('cloneVm');
        expect.soft(isCloneSelected, 'Clone existing VirtualMachine should be selected').toBe(true);

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Source — select the source VM', async () => {
        const sourceStepVisible = await vmWizardNavigationPage.verifyCloneSourceStepVisible();
        expect(sourceStepVisible, 'Source step heading should be visible').toBe(true);

        await vmWizardNavigationPage.searchCloneSourceByName(sourceVmName);
        await vmWizardNavigationPage.selectCloneSourceVm(sourceVmName);

        const nextDisabled = await vmWizardNavigationPage.isNextButtonDisabled();
        expect(nextDisabled, 'Next should be enabled after selecting a source VM').toBe(false);

        await vmWizardNavigationPage.clickNext();
      });

      const cloneVmName = utils.generateRandomVmName('clone-target');
      const cloneDescription = 'Created by the VM wizard clone test';

      await test.step('Step 3: Review and submit the expected clone values', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        await vmWizardComputePage.fillReviewVmName(cloneVmName);
        await vmWizardComputePage.fillReviewDescription(cloneDescription);

        expect(await vmWizardComputePage.getReviewVmName()).toBe(cloneVmName);
        expect(await vmWizardComputePage.getReviewDescription()).toBe(cloneDescription);

        await vmWizardNavigationPage.clickCloneVm();
      });

      await test.step('Verify the submitted VirtualMachineClone request', async () => {
        type VirtualMachineCloneRequest = KubernetesResource & {
          spec?: {
            patches?: string[];
            source?: { apiGroup?: string; kind?: string; name?: string };
            target?: { apiGroup?: string; kind?: string; name?: string };
          };
        };

        let cloneRequest: VirtualMachineCloneRequest | undefined;
        await expect
          .poll(
            async () => {
              const requests = await apiClient.listResources(
                'clone.kubevirt.io',
                'v1alpha1',
                'virtualmachineclones',
                cloneNs,
              );
              cloneRequest = requests.items.find(
                (item) => (item as VirtualMachineCloneRequest).spec?.target?.name === cloneVmName,
              ) as VirtualMachineCloneRequest | undefined;
              return cloneRequest;
            },
            {
              message: `VirtualMachineClone request for '${cloneVmName}' should be submitted`,
              timeout: utils.TestTimeouts.RESOURCE_CREATION,
            },
          )
          .toBeTruthy();

        expect(cloneRequest?.metadata?.namespace).toBe(cloneNs);
        expect(cloneRequest?.spec?.source).toMatchObject({
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: sourceVmName,
        });
        expect(cloneRequest?.spec?.target).toMatchObject({
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: cloneVmName,
        });

        const patches = (cloneRequest?.spec?.patches ?? []).map((patch) => JSON.parse(patch));
        expect(patches).toContainEqual(
          expect.objectContaining({
            path: '/metadata/annotations/description',
            value: cloneDescription,
          }),
        );
      });
    });
  },
);
