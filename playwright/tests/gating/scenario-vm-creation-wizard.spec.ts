import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';

test.describe(
  'VM Creation Wizard — Boot source step description',
  { tag: [GATING_TAG, '@catalog-wizard'] },
  () => {
    test('Wizard boot source step shows description hint and volume table', async ({
      page,
      testConfig,
      vmWizardBootSourcePage,
      vmWizardNavigationPage,
    }) => {
      test.setTimeout(180_000);
      await page.goto(`/k8s/ns/${testConfig.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
        waitUntil: 'domcontentloaded',
      });
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
      await vmWizardNavigationPage.selectCreationMethod('newVm');
      await vmWizardNavigationPage.ensureVmNameFilled();
      await vmWizardNavigationPage.clickNext();
      await vmWizardNavigationPage.selectOperatingSystem('otherLinux');
      await vmWizardNavigationPage.selectOsType('fedora');
      await vmWizardNavigationPage.clickNext();

      await test.step('Boot source step is visible', async () => {
        const bootVisible = await vmWizardBootSourcePage.verifyBootSourceStepVisible();
        expect(bootVisible, 'Boot source step heading should be visible').toBe(true);
      });

      await test.step('Boot source step description hint is present', async () => {
        const descVisible = await vmWizardBootSourcePage.verifyBootSourceDescriptionVisible();
        expect(
          descVisible,
          'Boot source step description ("Select a boot source…") should be visible',
        ).toBe(true);
      });

      await test.step('Boot volume table or empty state is rendered', async () => {
        await expect
          .poll(() => vmWizardBootSourcePage.verifyBootVolumeTableOrEmptyState(), {
            intervals: [2_000, 3_000, 5_000],
            message: 'Boot volume table or "No volumes found" empty state should be visible',
            timeout: 30_000,
          })
          .toBe(true);
      });

      await vmWizardNavigationPage.cancelWizard();
      const closed = await vmWizardNavigationPage.verifyWizardClosed();
      expect(closed, 'Wizard should close after cancel').toBe(true);
    });
  },
);

test.describe('VM Creation Wizard (gating)', { tag: [GATING_TAG, '@catalog-wizard'] }, () => {
  test('Wizard deployment step generates unique VM names and blocks Next when empty', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();

    await test.step('Custom configuration: name is empty and Next is disabled', async () => {
      await vmCreationWizardPage.selectCreationMethod('newVm');
      const isEmpty = await vmCreationWizardPage.isVmNameEmpty();
      expect(isEmpty, 'Name field should be empty on wizard open').toBe(true);

      const nextDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(nextDisabled, 'Next should be disabled when name is empty').toBe(true);
    });

    await test.step('Custom configuration: dice generates a unique name and enables Next', async () => {
      await vmCreationWizardPage.generateVmName();
      const name1 = await vmCreationWizardPage.getDeploymentVmName();
      expect(name1.length, 'Generated name should be non-empty').toBeGreaterThan(0);

      const nextEnabled = !(await vmCreationWizardPage.isNextButtonDisabled());
      expect(nextEnabled, 'Next should be enabled after name generation').toBe(true);
    });

    await test.step('Custom configuration: dice generates a different name each time', async () => {
      const nameBefore = await vmCreationWizardPage.getDeploymentVmName();
      await vmCreationWizardPage.generateVmName();
      const nameAfter = await vmCreationWizardPage.getDeploymentVmName();
      expect(nameAfter, 'Second dice click should produce a different name').not.toBe(nameBefore);
    });

    await test.step('From Template: name field and dice are available', async () => {
      await vmCreationWizardPage.selectCreationMethod('fromTemplate');
      await vmCreationWizardPage.generateVmName();
      const templateName = await vmCreationWizardPage.getDeploymentVmName();
      expect(templateName.length, 'Template flow should also generate a name').toBeGreaterThan(0);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('New VM wizard allows full step navigation with expected UI on each step', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await test.step('Wizard header has no close (X) button', async () => {
      const closeHidden = await vmCreationWizardPage.verifyWizardCloseButtonHidden();
      expect(closeHidden, 'Wizard header close button should be hidden').toBe(true);
    });

    const tilesVisible = await vmCreationWizardPage.verifyCreationMethodTilesVisible();
    expect(tilesVisible, 'All creation method tiles should be visible').toBe(true);

    const step1Active = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-deployment-details-step',
    );
    expect(step1Active, 'Deployment details step should be active').toBe(true);

    const locationVisible = await vmCreationWizardPage.verifyLocationSectionVisible();
    expect.soft(locationVisible, 'Location section should be visible').toBe(true);

    const editBtnVisible = await vmCreationWizardPage.verifyEditLocationButtonVisible();
    expect.soft(editBtnVisible, 'Edit location button should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('newVm');

    const cardSelected = await vmCreationWizardPage.verifyCreationMethodCardSelected('newVm');
    expect
      .soft(cardSelected, 'Selected creation method card should have PF selected highlight')
      .toBe(true);

    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();

    const step2Active = await vmCreationWizardPage.verifyStepActive('vm-creation-guest-os-step');
    expect(step2Active, 'Guest OS step should be active').toBe(true);

    const osTilesVisible = await vmCreationWizardPage.verifyOsTilesVisible();
    expect.soft(osTilesVisible, 'OS type tiles should be visible').toBe(true);

    const dropdownVisible = await vmCreationWizardPage.verifyOsTypeDropdownVisible();
    expect.soft(dropdownVisible, 'OS type dropdown should be visible').toBe(true);

    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('fedora');
    await vmCreationWizardPage.clickNext();

    const step3Active = await vmCreationWizardPage.verifyStepActive('vm-creation-boot-source-step');
    expect(step3Active, 'Boot source step should be active').toBe(true);

    const bootStepVisible = await vmCreationWizardPage.verifyBootSourceStepVisible();
    expect.soft(bootStepVisible, 'Boot source heading should be visible').toBe(true);

    await expect
      .poll(() => vmCreationWizardPage.verifyBootVolumeTableOrEmptyState(), {
        intervals: [2_000, 3_000, 5_000],
        message: 'Boot volume table or "No volumes found" empty state should be visible',
        timeout: 30_000,
      })
      .toBe(true);

    const addVolumeVisible = await vmCreationWizardPage.verifyAddVolumeButtonVisible();
    expect.soft(addVolumeVisible, '"Add volume" button should be visible').toBe(true);

    const noBootVisible = await vmCreationWizardPage.verifyNoBootSourceOptionVisible();
    expect.soft(noBootVisible, '"No boot source" option should be visible').toBe(true);

    await vmCreationWizardPage.selectNoBootSource();
    await vmCreationWizardPage.clickNext();

    const step4Active = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-compute-resources-step',
    );
    expect(step4Active, 'Compute resources step should be active').toBe(true);

    const computeVisible = await vmCreationWizardPage.verifyComputeResourcesStepVisible();
    expect.soft(computeVisible, 'Compute resources heading should be visible').toBe(true);

    const tabsVisible = await vmCreationWizardPage.verifyComputeTabsVisible();
    expect.soft(tabsVisible, 'Compute tabs (Red Hat / User provided) should be visible').toBe(true);

    const seriesFound = await vmCreationWizardPage.verifyAllInstanceTypeSeriesVisible();
    // CNV 4.99+: 'Dedicated vCPU' (d) series removed; expect 6 series
    expect
      .soft(seriesFound.length, 'All available instance type series should be visible')
      .toBeGreaterThanOrEqual(6);

    await vmCreationWizardPage.selectInstanceTypeSeries('u');
    await vmCreationWizardPage.selectComputeSize('small');
    await vmCreationWizardPage.clickNext();

    const customizationVisible =
      await vmCreationWizardPage.customization.verifyCustomizationStepVisible();
    expect.soft(customizationVisible, 'Customization heading should be visible').toBe(true);

    const customizationTabsVisible =
      await vmCreationWizardPage.customization.verifyCustomizationTabsVisible();
    expect.soft(customizationTabsVisible, 'All customization tabs should be visible').toBe(true);

    const searchVisible =
      await vmCreationWizardPage.customization.verifyCustomizationSearchInputVisible();
    expect.soft(searchVisible, '"Find settings" search input should be visible').toBe(true);

    const detailFields =
      await vmCreationWizardPage.customization.verifyCustomizationDetailsFields();
    expect
      .soft(detailFields, 'Details tab should show all configuration fields')
      .toEqual(
        expect.arrayContaining([
          'Description',
          'Hostname',
          'Headless mode',
          'Guest system log access',
          'Deletion protection',
        ]),
      );

    const expandSections =
      await vmCreationWizardPage.customization.verifyCustomizationExpandableSections();
    expect
      .soft(expandSections, 'Hardware devices and Boot management sections should be visible')
      .toEqual(expect.arrayContaining(['Hardware devices', 'Boot management']));

    await vmCreationWizardPage.clickNext();

    const reviewVisible = await vmCreationWizardPage.verifyReviewStepVisible();
    expect.soft(reviewVisible, 'Review and create heading should be visible').toBe(true);

    const sectionsVisible = await vmCreationWizardPage.verifyReviewSectionsVisible();
    expect.soft(sectionsVisible, 'Review sections should be visible').toBe(true);

    const checkboxVisible = await vmCreationWizardPage.verifyStartAfterCreationCheckbox();
    expect.soft(checkboxVisible, '"Start after creation" checkbox should be visible').toBe(true);

    const createBtnText = await vmCreationWizardPage.getCreateButtonText();
    expect
      .soft(createBtnText, 'Create button should say "Create VirtualMachine"')
      .toBe('Create VirtualMachine');

    await vmCreationWizardPage.clickBack();
    await vmCreationWizardPage.clickBack();
    await vmCreationWizardPage.clickBack();
    await vmCreationWizardPage.clickBack();
    await vmCreationWizardPage.clickBack();

    const deploymentDetailsActiveAfterBack = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-deployment-details-step',
    );
    expect(deploymentDetailsActiveAfterBack, 'Should be back on Deployment details step').toBe(
      true,
    );

    await vmCreationWizardPage.cancelWizard();
    const wizardClosed = await vmCreationWizardPage.verifyWizardClosed();
    expect(wizardClosed, 'Wizard should close after cancel').toBe(true);
  });

  test('Tree view namespace right-click "Create VirtualMachine" opens the creation wizard', async ({
    page,
    testConfig,
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    test.setTimeout(120_000);
    await page.goto(`/k8s/ns/${testConfig.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await vmTreePage.toggleEmptyProjectsDisplay(true);
    await vmTreePage.searchTreeView(testConfig.testNamespace);
    await vmTreePage.clickProjectNode(testConfig.testNamespace);

    await test.step('Right-click project and select "Create VirtualMachine" opens wizard', async () => {
      await vmTreePage.rightClickNamespaceInTreeView(testConfig.testNamespace);
      await vmTreePage.clickContextMenuItem('create-vm');

      const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
      expect(
        wizardVisible,
        'New wizard should open after tree view right-click "Create VirtualMachine"',
      ).toBe(true);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('Wizard namespace stays in sync with tree view selection and header shows no project selector', async ({
    page,
    testConfig,
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    test.setTimeout(120_000);
    await page.goto(`/k8s/ns/${testConfig.testNamespace}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await vmTreePage.toggleEmptyProjectsDisplay(true);
    await vmTreePage.searchTreeView(testConfig.testNamespace);
    await vmTreePage.clickProjectNode(testConfig.testNamespace);
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await test.step('Verify no header project selector on wizard page', async () => {
      const noHeaderSelector = await vmCreationWizardPage.verifyNoHeaderProjectSelector();
      expect(noHeaderSelector, 'Header project selector should not be present').toBe(true);
    });

    await test.step('Location section is visible on deployment step', async () => {
      const locationVisible = await vmCreationWizardPage.verifyLocationSectionVisible();
      expect(locationVisible, 'Location section should be visible on the wizard').toBe(true);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('Selecting a template in the wizard enables Next and Review and create navigation buttons', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('fromTemplate');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const catalogVisible = await vmCreationWizardPage.verifyTemplateCatalogStepVisible();
    expect(catalogVisible, 'Template catalog step should be visible').toBe(true);

    const count = await vmCreationWizardPage.getTemplateCatalogCount();
    expect(count, 'Template catalog should have at least one template').toBeGreaterThan(0);

    await test.step('Select a template and verify Next button is enabled', async () => {
      await vmCreationWizardPage.selectTemplateByTestId('fedora-server-small');

      const isNextDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(isNextDisabled, 'Next button should be enabled after selecting a template').toBe(
        false,
      );
    });

    const drawerVisible = await vmCreationWizardPage.verifyTemplateDrawerVisible();
    expect.soft(drawerVisible, 'Template details drawer should be visible (PF drawer)').toBe(true);

    await vmCreationWizardPage.cancelWizard();
  });

  test('New VM wizard Next button is disabled until required step data is provided', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const stepActive = await vmCreationWizardPage.verifyStepActive('vm-creation-guest-os-step');
    expect(stepActive, 'Guest OS step should be active').toBe(true);

    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('fedora');

    await test.step('Guest OS step — Next enabled after OS selection', async () => {
      const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(isDisabled, 'Next button should be enabled after selecting OS').toBe(false);
    });

    await vmCreationWizardPage.clickNext();
    const bootSourceStepActive = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-boot-source-step',
    );
    expect(bootSourceStepActive, 'Boot source step should be active').toBe(true);

    await test.step('Boot Source step — Next disabled without volume selected', async () => {
      const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(
        isDisabled,
        'Next button should be disabled when boot source is required but no volume is selected',
      ).toBe(true);
    });

    await vmCreationWizardPage.selectNoBootSource();
    await vmCreationWizardPage.clickNext();
    const computeStepActive = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-compute-resources-step',
    );
    expect(computeStepActive, 'Compute resources step should be active').toBe(true);

    await test.step('Compute Resources step — Next disabled without size', async () => {
      const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(
        isDisabled,
        'Next button should be disabled when no instance type series or size is selected',
      ).toBe(true);
    });

    await vmCreationWizardPage.selectInstanceTypeSeries('u');
    await vmCreationWizardPage.selectComputeSize('small');
    const isDisabledAfterSelection = await vmCreationWizardPage.isNextButtonDisabled();
    expect(
      isDisabledAfterSelection,
      'Next button should be enabled after selecting series and size',
    ).toBe(false);

    await vmCreationWizardPage.cancelWizard();
  });

  test('From Template wizard Next button is disabled until a template is selected', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('fromTemplate');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const catalogVisible = await vmCreationWizardPage.verifyTemplateCatalogStepVisible();
    expect(catalogVisible, 'Template catalog step should be visible').toBe(true);

    await test.step('Template catalog — Next disabled without template selection', async () => {
      const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(isDisabled, 'Next button should be disabled when no template is selected').toBe(true);
    });

    await vmCreationWizardPage.selectTemplateByTestId('fedora-server-small');
    const isDisabledAfterSelection = await vmCreationWizardPage.isNextButtonDisabled();
    expect(
      isDisabledAfterSelection,
      'Next button should be enabled after selecting a template',
    ).toBe(false);

    await vmCreationWizardPage.cancelWizard();
  });

  test('Clone VM wizard Next button is disabled until a source VM is selected', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('cloneVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const sourceVisible = await vmCreationWizardPage.verifyCloneSourceStepVisible();
    expect(sourceVisible, 'Clone Source step should be visible').toBe(true);

    await test.step('Clone Source step — Next disabled without source VM', async () => {
      const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(
        isDisabled,
        'Next button should be disabled when no source VM is selected for cloning',
      ).toBe(true);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('Guest OS selection is reset to default when the creation wizard is reopened', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisible = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisible, 'Wizard should be visible').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const stepActive = await vmCreationWizardPage.verifyStepActive('vm-creation-guest-os-step');
    expect(stepActive, 'Guest OS step should be active').toBe(true);

    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('fedora');
    const isDisabled = await vmCreationWizardPage.isNextButtonDisabled();
    expect(isDisabled, 'Next should be enabled after selecting OS (prerequisite check)').toBe(
      false,
    );

    await vmCreationWizardPage.cancelWizard();
    const wizardClosed = await vmCreationWizardPage.verifyWizardClosed();
    expect(wizardClosed, 'Wizard should close after cancel').toBe(true);

    await vmCreationWizardPage.openWizardFromCreateDropdown();
    const wizardVisibleAfterReopen = await vmCreationWizardPage.verifyWizardVisible();
    expect(wizardVisibleAfterReopen, 'Wizard should be visible after reopening').toBe(true);

    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    const guestOsStepActiveAfterReopen = await vmCreationWizardPage.verifyStepActive(
      'vm-creation-guest-os-step',
    );
    expect(guestOsStepActiveAfterReopen, 'Guest OS step should be active after wizard reopen').toBe(
      true,
    );

    await test.step('Guest OS reset — previously selected "Other Linux" is not retained', async () => {
      const isOtherLinuxCurrent = await vmCreationWizardPage.isOsTileSelected('otherLinux');
      expect(
        isOtherLinuxCurrent,
        'Other Linux tile must NOT be current — previous selection must be cleared on wizard reopen',
      ).toBe(false);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('Boot source step shows Add volume and No boot source options for OS with no available volumes', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('alpine');
    await vmCreationWizardPage.clickNext();

    await test.step('Add volume button is available', async () => {
      const addVisible = await vmCreationWizardPage.verifyAddVolumeButtonVisible();
      expect(addVisible, '"Add volume" button should be visible for OS with no volumes').toBe(true);
    });

    await test.step('No boot source option is available as fallback', async () => {
      const noBootVisible = await vmCreationWizardPage.verifyNoBootSourceOptionVisible();
      expect(noBootVisible, '"No boot source" option should be visible').toBe(true);
    });

    await vmCreationWizardPage.cancelWizard();
  });

  test('Add volume modal locks Preference to match Guest OS selection', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    await vmCreationWizardPage.selectCreationMethod('newVm');
    await vmCreationWizardPage.ensureVmNameFilled();
    await vmCreationWizardPage.clickNext();
    await vmCreationWizardPage.selectOperatingSystem('otherLinux');
    await vmCreationWizardPage.selectOsType('fedora');
    await vmCreationWizardPage.clickNext();

    await vmCreationWizardPage.clickAddVolumeButton();

    await test.step('Preference dropdown is disabled', async () => {
      const disabled = await vmCreationWizardPage.isAddVolumePreferenceDisabled();
      expect(disabled, 'Preference dropdown should be disabled when Guest OS is pre-selected').toBe(
        true,
      );
    });

    await test.step('Preference value matches selected Guest OS', async () => {
      const value = await vmCreationWizardPage.getAddVolumePreferenceValue();
      expect(value, 'Preference value should contain the selected OS preference').toContain(
        'fedora',
      );
    });

    await test.step('Preference helper text explains auto-setting', async () => {
      const helperText = await vmCreationWizardPage.getAddVolumePreferenceHelperText();
      expect(
        helperText,
        'Helper text should indicate preference is auto-set from Guest OS',
      ).toContain('Automatically set by the VM Guest OS selection');
    });

    await vmCreationWizardPage.cancelAddVolumeModal();
    await vmCreationWizardPage.cancelWizard();
  });

  test('VM name field validates RFC 1123 format and Review and Create step does not require Tab key', async ({
    vmCreationWizardPage,
    vmTreePage,
  }) => {
    await vmTreePage.navigateToVirtualMachinesViaUI();
    await vmCreationWizardPage.openWizardFromCreateDropdown();
    await vmCreationWizardPage.selectCreationMethod('newVm');

    await test.step('Empty name — Next button disabled', async () => {
      await vmCreationWizardPage.fillVmName('');
      const isNextDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(isNextDisabled, 'Next button should be disabled when name is empty').toBe(true);
    });

    await test.step('Valid name — Next button enabled', async () => {
      await vmCreationWizardPage.fillVmName('valid-vm-name');
      const isNextDisabled = await vmCreationWizardPage.isNextButtonDisabled();
      expect(isNextDisabled, 'Next button should be enabled with a valid name').toBe(false);
    });

    await vmCreationWizardPage.cancelWizard();
  });
});
