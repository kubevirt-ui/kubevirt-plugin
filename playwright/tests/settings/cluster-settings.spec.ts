import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

const SUITE = 'Cluster Settings';

test.describe('Cluster Settings', { tag: [CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.navigateToSettingsViaSidebar();
  });

  // ── Page-level ────────────────────────────────────────────────────────────────

  test('Settings page shows Cluster, User, and Preview features tabs', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

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
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.fillConfigurationSearchInput('General');
    const result = await settingsPage.verifyHighlightedSearchResultsVisible();
    expect(result.isVisible, 'Search dropdown should show at least one suggestion').toBe(true);
    expect(result.count, 'At least one suggestion should appear').toBeGreaterThan(0);
  });

  test('Installed version shows expected prefix and update status', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const ok = await settingsPage.verifyInstalledVersion(
      utils.VERSION.VERSION_PREFIX,
      utils.VERSION.STATUS,
    );
    expect.soft(ok, 'Installed version visible with expected prefix and status').toBe(true);
  });

  // ── Cluster tab — Virtualization features section ─────────────────────────────

  test('Virtualization features section is accessible and lists expected operators', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToVirtualizationFeatures();

    await test.step('Virtualization features section visible', async () => {
      const visible = await settingsPage.verifyVirtualizationFeatures();
      expect(visible, 'Virtualization features section should be visible').toBe(true);
    });

    await test.step('Configure features button visible', async () => {
      const configBtnVisible = await settingsPage.isConfigureFeaturesButtonVisible();
      expect.soft(configBtnVisible, '"Configure features" button should be visible').toBe(true);
    });

    await test.step('Expected feature items are listed', async () => {
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
            `Feature "${expected}" should be listed (found: ${features.join(', ')})`,
          )
          .toBe(true);
      }
    });
  });

  // ── Cluster tab — General settings section ────────────────────────────────────

  test('General settings section shows all expected sub-sections', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGeneralSettings();

    const subSections = await settingsPage.getGeneralSettingsSubSections();
    for (const expected of [
      'Live migration',
      'Memory request ratio',
      'SSH configurations',
      'Templates and images management',
      'VirtualMachine actions confirmation',
    ]) {
      expect
        .soft(
          subSections.some((s) => s.includes(expected)),
          `Sub-section "${expected}" should be present (found: ${subSections.join(', ')})`,
        )
        .toBe(true);
    }
  });

  test('Live migration limits can be set via UI and are reflected in the cluster', async ({
    settingsPage,
    k8sClient,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.setLiveMigrationLimits(
      utils.MIGRATION_CONFIG.PARALLEL_PER_CLUSTER,
      utils.MIGRATION_CONFIG.PARALLEL_PER_NODE,
    );

    await expect(async () => {
      const limits = await k8sClient.verifyLiveMigrationLimits(
        utils.MIGRATION_CONFIG.PARALLEL_PER_CLUSTER,
        utils.MIGRATION_CONFIG.PARALLEL_PER_NODE,
      );
      expect
        .soft(
          limits.parallelMigrationsPerCluster,
          `Cluster limit should be ${utils.MIGRATION_CONFIG.PARALLEL_PER_CLUSTER}, got ${limits.actualParallelMigrationsPerCluster}`,
        )
        .toBe(true);
      expect(
        limits.parallelOutboundMigrationsPerNode,
        `Node limit should be ${utils.MIGRATION_CONFIG.PARALLEL_PER_NODE}, got ${limits.actualParallelOutboundMigrationsPerNode}`,
      ).toBe(true);
    }).toPass({ intervals: [2_000, 3_000, 5_000], timeout: 20_000 });
  });

  test('Memory request ratio section is accessible and stepper changes value', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGeneralSettings();
    const opened = await settingsPage.openMemoryRequestRatioSettings();
    expect.soft(opened, 'Memory request ratio section should open').toBe(true);

    const initialValue = await settingsPage.getMemoryRequestRatioValue();
    expect.soft(initialValue, 'Initial ratio value should be readable').toBeTruthy();

    const adjusted = await settingsPage.adjustMemoryRequestRatio(-1);
    expect.soft(adjusted, 'Memory request ratio adjusted via stepper').toBe(true);

    const adjustedValue = await settingsPage.getMemoryRequestRatioValue();
    expect
      .soft(adjustedValue, 'Value should differ from initial after adjustment')
      .not.toBe(initialValue);
  });

  test('Automatic images download section is accessible via Templates and images management', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGeneralSettings();
    const loaded = await settingsPage.navigateToAutomaticImagesDownload();
    expect(loaded, 'Automatic images download section should load').toBe(true);
  });

  test('VirtualMachine actions confirmation toggle can be enabled and disabled', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGeneralSettings();

    const initial = await settingsPage.getVmActionsConfirmationState();

    const toggled = await settingsPage.setVmActionsConfirmation(!initial);
    expect(toggled, 'VM actions confirmation toggle should respond to change').toBe(true);

    const restored = await settingsPage.setVmActionsConfirmation(initial);
    expect(restored, 'VM actions confirmation toggle should be restored to original state').toBe(
      true,
    );
  });

  test('Hide YAML tab toggle persists after enabling and can be restored via API', async ({
    settingsPage,
    k8sClient,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'settings', 'hide-yaml-tab'],
    });

    await k8sClient.patchConfigMap('kubevirt-ui-features', utils.EnvVariables.cnvNamespace, {
      hideYamlTab: 'false',
    });

    await settingsPage.navigateToGeneralSettings();

    try {
      const toggledOn = await settingsPage.setHideYamlTab(true);
      expect.soft(toggledOn, 'hideYamlTab toggle should succeed').toBe(true);

      await expect(async () => {
        const cm = await k8sClient.getConfigMap(
          'kubevirt-ui-features',
          utils.EnvVariables.cnvNamespace,
        );
        const cmData = cm?.data as Record<string, string> | undefined;
        const cmValue = cmData?.hideYamlTab;
        expect(cmValue, 'hideYamlTab should be "true" in configmap').toBe('true');
      }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });

      const toggledOff = await settingsPage.setHideYamlTab(false);
      expect.soft(toggledOff, 'hideYamlTab toggle off should succeed').toBe(true);

      await expect(async () => {
        const cm = await k8sClient.getConfigMap(
          'kubevirt-ui-features',
          utils.EnvVariables.cnvNamespace,
        );
        const cmData = cm?.data as Record<string, string> | undefined;
        const cmValue = cmData?.hideYamlTab;
        expect(cmValue, 'hideYamlTab should be "false" in configmap').toBe('false');
      }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
    } finally {
      await k8sClient.patchConfigMap('kubevirt-ui-features', utils.EnvVariables.cnvNamespace, {
        hideYamlTab: 'false',
      });
    }
  });

  test('Advanced CD-ROM features toggle can be enabled and disabled', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGeneralSettings();
    const opened = await settingsPage.openAdvancedCdromFeaturesSettings();
    expect.soft(opened, 'Advanced CD-ROM features section should open').toBe(true);

    const initiallyEnabled = await settingsPage.isAdvancedCdromFeaturesEnabled();

    if (initiallyEnabled) {
      const disabled = await settingsPage.disableAdvancedCdromFeatures();
      expect.soft(disabled, 'Advanced CD-ROM features should be disabled').toBe(true);
      const reEnabled = await settingsPage.enableAdvancedCdromFeatures();
      expect.soft(reEnabled, 'Advanced CD-ROM features should be re-enabled').toBe(true);
    } else {
      const enabled = await settingsPage.enableAdvancedCdromFeatures();
      expect.soft(enabled, 'Advanced CD-ROM features should be enabled').toBe(true);
      const reDisabled = await settingsPage.disableAdvancedCdromFeatures();
      expect.soft(reDisabled, 'Advanced CD-ROM features should be re-disabled').toBe(true);
    }
  });

  // ── Cluster tab — Guest management section ────────────────────────────────────

  test('Guest system log can be enabled and disabled via settings', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToGuestManagement();

    const initial = await settingsPage.isGuestSystemLogEnabled();

    try {
      const toggled = await settingsPage.setGuestSystemLog(!initial);
      expect(toggled, 'Guest system log toggle should respond to change').toBe(true);

      const restored = await settingsPage.setGuestSystemLog(initial);
      expect(restored, 'Guest system log should be restored to original state').toBe(true);
    } finally {
      await settingsPage.setGuestSystemLog(initial);
    }
  });

  test('Automatic subscription of new RHEL VirtualMachines section is accessible', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const loaded = await settingsPage.navigateToAutomaticSubscription();
    expect(loaded, 'Automatic subscription section should load').toBe(true);
  });

  test('Hide guest credentials for non-privileged users toggle can be enabled and disabled', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG],
    });

    await settingsPage.navigateToGuestManagement();

    const initial = await settingsPage.isHideGuestCredentialsEnabled();

    try {
      const toggled = await settingsPage.hideGuestCredentials(!initial);
      expect(toggled, 'Hide guest credentials toggle should respond to change').toBe(true);

      const restored = await settingsPage.hideGuestCredentials(initial);
      expect(restored, 'Hide guest credentials should be restored to original state').toBe(true);
    } finally {
      await settingsPage.hideGuestCredentials(initial);
    }
  });

  // ── Cluster tab — Resource management section ──────────────────────────────────

  test('Resource management shows AAQ Application Aware Quota control', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await settingsPage.navigateToResourceManagement();
    const aaqVisible = await settingsPage.isAaqControlVisible();
    expect(aaqVisible, 'AAQ toggle should be visible in Resource management').toBe(true);
  });

  // ── Cluster tab — SCSI persistent reservation section ─────────────────────────

  test('SCSI persistent reservation section is accessible', async ({ settingsPage, utils }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const sections = await settingsPage.getClusterSettingsSectionNames();
    expect(
      sections.some((s) => s.includes('SCSI persistent reservation')),
      `"SCSI persistent reservation" should be listed (found: ${sections.join(', ')})`,
    ).toBe(true);
  });

  // ── Preview features tab ────────────────────────────────────────────────────────

  test('Preview features tab shows VM folders, Passt binding, and native VM templates options', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'settings', 'preview-features'],
    });

    const loaded = await settingsPage.navigateToPreviewFeatures();
    expect(loaded, 'Preview features tab should load').toBe(true);

    const labels = await settingsPage.getPreviewFeatureLabels();

    await test.step('VM folders feature flag is present', async () => {
      const hasFolders = labels.some(
        (l) => l.toLowerCase().includes('folder') || l.toLowerCase().includes('tree view'),
      );
      expect.soft(hasFolders, 'VM folders preview feature should be listed').toBe(true);
    });

    await test.step('Passt binding feature flag is present', async () => {
      const hasPasst = labels.some((l) => l.toLowerCase().includes('passt'));
      expect.soft(hasPasst, 'Passt binding preview feature should be listed').toBe(true);
    });

    await test.step('Native VirtualMachine templates feature flag is present', async () => {
      const hasNativeTemplates = labels.some(
        (l) => l.toLowerCase().includes('template') || l.toLowerCase().includes('native'),
      );
      expect
        .soft(hasNativeTemplates, 'Native VM templates preview feature should be listed')
        .toBe(true);
    });
  });

  test('Cross-cluster live migration flag is removed from preview features', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'settings', 'preview-features'],
    });

    const navigated = await settingsPage.navigateToPreviewFeatures();
    expect.soft(navigated, 'Preview features tab should be accessible').toBe(true);

    const labels = await settingsPage.getPreviewFeatureLabels();
    const hasCCLM = labels.some(
      (label) =>
        label.toLowerCase().includes('cross-cluster') ||
        label.toLowerCase().includes('cclm') ||
        label.toLowerCase().includes('cross cluster'),
    );
    expect
      .soft(hasCCLM, 'CCLM should not appear in preview features after flag removal (CNV-80123)')
      .toBe(false);
  });
});
