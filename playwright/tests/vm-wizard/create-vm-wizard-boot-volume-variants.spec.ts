import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { BOOT_VOLUME_DEFAULT_VARIANT } from '@/data-models/constants';
import { ROUTE_VM_WIZARD_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/create-vm-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Creation Wizard';

test.describe(
  'VM Creation Wizard — Boot volume preference variants (CNV-97314)',
  { tag: [ROUTE_VM_WIZARD_TAG, T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG] },
  () => {
    test('Boot source table shows Variant column and selecting a row applies preference', async ({
      apiClient,
      vmListPage,
      vmWizardNavigationPage,
      vmWizardBootSourcePage,
      vmWizardComputePage,
      utils,
    }) => {
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@catalog-wizard', ADMIN_ONLY_TAG],
      });

      const wizardNs = await setupTestNamespace(apiClient, 'wizard-vol-variant');
      let selectedVariant = '';

      await vmListPage.switchToVirtualizationPerspective();
      await vmListPage.navigateToProjectVmListViaUI(wizardNs);
      await vmWizardNavigationPage.openWizardFromCreateDropdown();

      await test.step('Step 1: Deployment details', async () => {
        await vmWizardNavigationPage.selectLocationProject(wizardNs);
        await vmWizardNavigationPage.generateVmName();
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 2: Guest OS — select RHEL', async () => {
        await vmWizardNavigationPage.selectOperatingSystem('rhel');
        await expect
          .poll(() => vmWizardNavigationPage.isNextButtonDisabled(), {
            message: 'Next should enable once Guest OS options finish loading',
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .toBe(false);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 3: Boot source — Variant column and volume selection', async () => {
        const bootStepVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect(bootStepVisible, 'Boot source step should be visible').toBe(true);

        const tableVisible = await vmWizardBootSourcePage.verifyBootVolumeTableVisible();
        expect(tableVisible, 'Boot volume table should be visible for the selected Guest OS').toBe(
          true,
        );

        const columnsVisible = await vmWizardBootSourcePage.verifyBootVolumeTableColumnsVisible();
        expect(columnsVisible, 'Boot volume table should include the Variant column').toBe(true);

        const variantRows = await vmWizardBootSourcePage.getBootVolumeVariantRows();
        expect(
          variantRows.length,
          'At least one boot volume variant row should be listed',
        ).toBeGreaterThan(0);

        const preferredRow =
          variantRows.find(
            (row) => row.variant.toLowerCase() !== BOOT_VOLUME_DEFAULT_VARIANT.toLowerCase(),
          ) ?? variantRows[0];
        selectedVariant = preferredRow.variant;
        await vmWizardBootSourcePage.selectBootVolumeByNameAndVariant(
          preferredRow.name,
          preferredRow.variant,
        );

        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 4: Compute resources', async () => {
        const computeVisible = await vmWizardComputePage.verifyComputeResourcesStepVisible();
        expect.soft(computeVisible, 'Compute resources step should be visible').toBe(true);

        await vmWizardComputePage.selectInstanceTypeSeries('u');
        await vmWizardComputePage.selectComputeSize('medium');
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 5: Customization', async () => {
        const custVisible = await vmWizardComputePage.verifyCustomizationStepVisible();
        expect.soft(custVisible, 'Customization step should be visible').toBe(true);
        await vmWizardNavigationPage.clickNext();
      });

      await test.step('Step 6: Review and create — preference is applied on the VM', async () => {
        const reviewVisible = await vmWizardComputePage.verifyReviewStepVisible();
        expect(reviewVisible, 'Review step should be visible').toBe(true);

        await vmWizardNavigationPage.clickCreateVm();
        const redirected = await vmWizardNavigationPage.verifyRedirectedToVmDetails();
        expect(redirected, 'Should redirect to VM details after creation').toBe(true);

        const vmName = await vmWizardNavigationPage.getCreatedVmNameFromUrl();
        const vmNs = await vmWizardNavigationPage.getCreatedVmNamespaceFromUrl();
        expect(vmName.length, 'VM name should be in the URL').toBeGreaterThan(0);
        expect(vmNs, 'VM should be created in the test namespace').toBe(wizardNs);
        apiClient.trackResource('VirtualMachine', vmName, vmNs);

        const vm = await apiClient.getVirtualMachine(vmNs, vmName);
        const preferenceName = (
          vm?.spec as { preference?: { name?: string } } | undefined
        )?.preference?.name;
        expect(
          preferenceName?.length ?? 0,
          'Created VM should have a preference applied from the selected boot volume row',
        ).toBeGreaterThan(0);

        if (selectedVariant.toLowerCase() !== BOOT_VOLUME_DEFAULT_VARIANT.toLowerCase()) {
          expect(
            preferenceName?.toLowerCase(),
            `Selected variant "${selectedVariant}" should be reflected in the VM preference name`,
          ).toContain(selectedVariant.toLowerCase());
        }
      });
    });
  },
);
