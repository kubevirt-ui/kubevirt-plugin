import { ADMIN_ONLY_TAG, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-settings-fixture';
import { TestTimeouts } from '@/utils/test-config';

const SUITE = `CNV Settings (read-only) ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${CNV_SETTINGS_TAG} ${ADMIN_ONLY_TAG}`;

test.describe(SUITE, () => {
  // Serial within the file: parallel workers still run other projects; settings drill-ins
  // remount the same Cluster panel and flake when many workers expand sections concurrently.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ settingsPage }) => {
    test.setTimeout(TestTimeouts.TEST_LONG);
    await settingsPage.goToSettings();
  });

  test('Settings page shows Cluster, User, and Preview features tabs', async ({ settingsPage }) => {
    const tabs = await settingsPage.getSettingsTabNames();
    for (const expected of ['Cluster', 'User', 'Preview features']) {
      expect
        .soft(
          tabs.some((t) => t.includes(expected)),
          `Tab "${expected}" should be present`,
        )
        .toBe(true);
    }
  });

  test('Settings search filter shows autocomplete suggestions for a query', async ({
    settingsPage,
  }) => {
    await settingsPage.fillConfigurationSearchInput('General');
    const result = await settingsPage.verifyHighlightedSearchResultsVisible();
    expect(result.isVisible, 'Search dropdown should show suggestions').toBe(true);
    expect(result.count).toBeGreaterThan(0);
  });

  test('Installed version shows expected prefix and update status', async ({ settingsPage }) => {
    const ok = await settingsPage.verifyInstalledVersion();
    expect(ok, 'Installed version and update status should be visible').toBe(true);
  });

  test('Virtualization features section is accessible and lists expected operators', async ({
    settingsPage,
  }) => {
    await settingsPage.navigateToVirtualizationFeatures();
    const features = await settingsPage.getVirtualizationFeatureItems();
    for (const expected of [
      'Cluster observability',
      'Network observability',
      'Host network management',
      'High availability',
      'Load balance',
    ]) {
      expect
        .soft(
          features.some((f) => f.includes(expected)),
          `Feature "${expected}" should be listed`,
        )
        .toBe(true);
    }
    await expect(settingsPage.configureFeaturesButton()).toBeVisible();
  });

  test('General settings section shows all expected sub-sections', async ({ settingsPage }) => {
    const sections = await settingsPage.getClusterSettingsSectionNames();
    for (const expected of [
      'Virtualization features',
      'General settings',
      'Guest management',
      'Resource management',
      'SCSI persistent reservation',
    ]) {
      expect
        .soft(
          sections.some((s) => s.includes(expected)),
          `Section "${expected}" should be present`,
        )
        .toBe(true);
    }

    const subSections = await settingsPage.getGeneralSettingsSubSections();
    for (const expected of [
      'Live migration',
      'Memory density',
      'SSH configurations',
      'Templates and images management',
      'VirtualMachine actions confirmation',
      'YAML tab visibility',
    ]) {
      expect
        .soft(
          subSections.some((s) => s.includes(expected)),
          `General sub-section "${expected}" should be present`,
        )
        .toBe(true);
    }
  });

  test('Live migration limits controls are visible and editable without applying changes', async ({
    settingsPage,
  }) => {
    await settingsPage.openGeneralSubSection('Live migration');
    await expect(settingsPage.liveMigrationParallelClusterInput()).toBeVisible();
    await expect(settingsPage.liveMigrationParallelNodeInput()).toBeVisible();
    await expect(settingsPage.liveMigrationParallelClusterInput()).toBeEnabled();
    await expect(settingsPage.liveMigrationParallelNodeInput()).toBeEnabled();
  });

  test('Memory density toggle is present and can be interacted with', async ({ settingsPage }) => {
    await settingsPage.openGeneralSubSection('Memory density');
    const toggle = settingsPage.memoryDensityToggle();
    expect(await settingsPage.isControlInteractive(toggle)).toBe(true);
  });

  test('Automatic images download section is accessible via Templates and images management', async ({
    settingsPage,
  }) => {
    await settingsPage.openTemplatesAndImagesManagement();
    await expect(settingsPage.automaticImagesDownloadButton()).toBeVisible();
    await settingsPage.automaticImagesDownloadButton().click();
    expect(
      await settingsPage.isControlInteractive(settingsPage.centosStream9AutoDownloadSwitch()),
    ).toBe(true);
  });

  test('VirtualMachine actions confirmation toggle is present and enabled', async ({
    settingsPage,
  }) => {
    await settingsPage.openGeneralSubSection('VirtualMachine actions confirmation');
    expect(
      await settingsPage.isControlInteractive(settingsPage.vmActionsConfirmationSwitch()),
    ).toBe(true);
  });

  test('Hide YAML tab toggle is present and enabled', async ({ settingsPage }) => {
    await settingsPage.openGeneralSubSection('YAML tab visibility');
    expect(await settingsPage.isControlInteractive(settingsPage.hideYamlTabSwitch())).toBe(true);
  });

  test('Advanced CD-ROM features sub-section is reachable in General settings', async ({
    settingsPage,
  }) => {
    await settingsPage.openGeneralSubSection('Advanced CD-ROM features');
    const toggle = settingsPage.advancedCdromFeaturesToggle();
    const subsectionCopy = settingsPage.page.getByText(/Advanced CD-ROM features/i).first();
    await expect(subsectionCopy).toBeVisible();
    if (await toggle.isVisible().catch(() => false)) {
      expect(await settingsPage.isControlInteractive(toggle)).toBe(true);
    } else {
      test.info().annotations.push({
        type: 'settings',
        description: 'CD-ROM toggle not rendered; sub-section entry still validated',
      });
    }
  });

  test('Guest system log control is present under Guest management', async ({ settingsPage }) => {
    await settingsPage.navigateToGuestManagement();
    expect(await settingsPage.isControlInteractive(settingsPage.guestSystemLogSwitch())).toBe(true);
  });

  test('Automatic subscription of new RHEL VirtualMachines section is accessible', async ({
    page,
    settingsPage,
  }) => {
    await settingsPage.openAutomaticSubscriptionSection();
    await expect(
      page.getByText(/Automatic subscription|RHEL VirtualMachines/i).first(),
    ).toBeVisible();
  });

  test('Hide guest credentials for non-privileged users toggle is present and enabled', async ({
    settingsPage,
  }) => {
    await settingsPage.navigateToGuestManagement();
    expect(await settingsPage.isControlInteractive(settingsPage.hideCredentialsSwitch())).toBe(
      true,
    );
  });

  test('Resource management shows KSM memory optimization control', async ({ settingsPage }) => {
    await settingsPage.navigateToResourceManagement();
    expect(await settingsPage.isControlInteractive(settingsPage.ksmSwitch())).toBe(true);
  });

  test('Application Aware Quota control and quotas list page are reachable', async ({
    settingsPage,
  }) => {
    await settingsPage.navigateToResourceManagement();
    expect(await settingsPage.isControlInteractive(settingsPage.aaqSwitch().first())).toBe(true);
    // Quotas list requires AAQ CRD; when disabled/uninstalled the control alone is gating signal.
    const manageVisible = await settingsPage
      .manageQuotasLink()
      .isVisible()
      .catch(() => false);
    const quotasLoaded = await settingsPage.expectQuotasListPage();
    if (manageVisible) {
      expect(quotasLoaded, 'Manage quotas should open the AAQ list page').toBe(true);
    }
  });

  test('SCSI persistent reservation section is accessible', async ({ settingsPage }) => {
    await settingsPage.navigateToScsiPersistentReservation();
    expect(
      await settingsPage.isControlInteractive(settingsPage.persistentReservationSwitch()),
    ).toBe(true);
  });

  test('Preview features tab shows VM folders, Passt binding, and native VM templates options', async ({
    settingsPage,
  }) => {
    await settingsPage.openTab('features');
    await expect(settingsPage.previewFeaturesPanel()).toContainText(
      /Preview features are for testing purposes/i,
    );
    for (const id of ['treeViewFolders', 'passtUDNNetwork', 'vmTemplates']) {
      expect(
        await settingsPage.isControlInteractive(settingsPage.previewFeatureSwitch(id)),
        `Preview switch ${id} should be visible and enabled`,
      ).toBe(true);
    }
  });

  test('Cross-cluster live migration flag is removed from preview features', async ({
    settingsPage,
  }) => {
    const labels = await settingsPage.getPreviewFeatureLabels();
    const combined = labels.join(' ').toLowerCase();
    expect(combined).not.toMatch(/cross-cluster|cclm|cross cluster/);
  });

  test('SSH key management section shows public key editor without saving', async ({
    page,
    settingsPage,
  }) => {
    await settingsPage.openManageSshKeysSection();
    await expect(settingsPage.sshKeyEditorVisible()).toBeVisible();
    await expect(page.locator('[data-test-id="select-project-toggle"]')).toBeVisible();
  });

  test('User settings permissions section shows expected tasks', async ({ page, settingsPage }) => {
    await settingsPage.openPermissionsSection();
    await expect(page.getByText(/Attach VirtualMachine to multiple networks/i)).toBeVisible();
    await expect(page.getByText(/Clone a VirtualMachine/i)).toBeVisible();
    await expect(page.getByText(/Upload a base image from local disk/i)).toBeVisible();
  });

  test('Getting started resources section shows Welcome information and Guided tour options', async ({
    page,
    settingsPage,
  }) => {
    await settingsPage.openGettingStartedResourcesSection();
    await expect(page.getByText(/^Welcome information$/i)).toBeVisible();
    await expect(page.getByText(/^Guided tour$/i)).toBeVisible();
  });

  test('Welcome information and Guided tour toggles are present and enabled', async ({
    settingsPage,
  }) => {
    await settingsPage.openGettingStartedResourcesSection();
    expect(await settingsPage.isControlInteractive(settingsPage.welcomeInformationSwitch())).toBe(
      true,
    );
    expect(await settingsPage.isControlInteractive(settingsPage.guidedTourSwitch())).toBe(true);
  });

  test('Auto-compute CPU and memory limits switch is visible under Resource management', async ({
    settingsPage,
  }) => {
    await settingsPage.navigateToResourceManagement();
    expect(await settingsPage.isControlInteractive(settingsPage.autoComputeCpuLimitsSwitch())).toBe(
      true,
    );
  });
});
