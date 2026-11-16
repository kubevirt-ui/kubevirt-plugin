import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';
import { TestTimeouts } from '@/utils/test-config';

const SUITE = 'Recommended capabilities';

/** Autopilot / install-automatically capabilities (see AUTOPILOT_REGISTRY). */
const AUTO_CAPABILITIES = ['Load balancing', 'Migrate VMs', 'Virtualization dashboards'] as const;

/** Manual-setup capabilities (Additional capabilities table). */
const MANUAL_CAPABILITIES = [
  'Backup and recovery',
  'Hardware-aware scheduling',
  'High availability',
  'Host network management',
  'Isolated workloads (Kata)',
  'Manage clusters from a hub',
  'NUMA-aware scheduling',
] as const;

test.describe('Recommended capabilities', { tag: [CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  test.beforeEach(async ({ virtualizationSettingsPage: settings }) => {
    await settings.goToRecommendedCapabilities();
  });

  test('Tab chrome shows both capability sections', async ({
    virtualizationSettingsPage: settings,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    await expect(settings.settingsTab('recommended')).toHaveAttribute('aria-selected', 'true');
    await expect(settings.page).toHaveURL(/\/virtualization-settings\/recommended/);
    await expect(settings.manageCapabilitiesHeading()).toBeVisible();
    await expect(settings.installAutomaticallyCardTitle()).toBeVisible();
    await expect(settings.additionalCapabilitiesCardTitle()).toBeVisible();
  });

  test('Additional capabilities table is readable and expandable', async ({
    virtualizationSettingsPage: settings,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const table = settings.manualCapabilitiesTable();
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /^Name$/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /^Status$/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Configuration/i })).toHaveCount(0);

    for (const name of MANUAL_CAPABILITIES) {
      await expect
        .soft(settings.capabilityRow(table, name), `Manual capability "${name}" should be listed`)
        .toBeVisible();
      await expect
        .soft(
          settings.capabilityRow(table, name).getByRole('checkbox'),
          `Manual capability "${name}" should not be selectable`,
        )
        .toHaveCount(0);
    }

    await settings.expandCapabilityRow(table, 'Backup and recovery');
    await expect(table.getByRole('row', { name: /OADP/i })).toBeVisible();

    // Install CTA belongs to the automatic card only — still present on page, not in manual card.
    await expect(settings.installSelectedButton()).toBeVisible();
  });

  test('Install automatically list shows toolbar and disabled Install selected', async ({
    virtualizationSettingsPage: settings,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const table = settings.autoCapabilitiesTable();
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /^Name$/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /^Status$/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /^Configuration$/i })).toBeVisible();

    await expect(settings.capabilitiesSearchInput()).toBeVisible();
    await expect(settings.capabilitiesStatusFilterToggle()).toBeVisible();
    await expect(settings.page.getByRole('checkbox', { name: /Select page/i })).toBeVisible();

    await settings.clearAutoCapabilitySelection();
    await expect(settings.installSelectedButton()).toBeVisible();
    expect(
      await settings.isInstallSelectedEnabled(),
      'Install selected should be disabled with no selection',
    ).toBe(false);

    for (const name of AUTO_CAPABILITIES) {
      await expect
        .soft(settings.capabilityRow(table, name), `Auto capability "${name}" should be listed`)
        .toBeVisible();
    }
  });

  test('Selecting each installable capability enables Install selected', async ({
    virtualizationSettingsPage: settings,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const table = settings.autoCapabilitiesTable();
    await expect(table).toBeVisible();
    await settings.clearAutoCapabilitySelection();
    expect(await settings.isInstallSelectedEnabled()).toBe(false);

    const names = await settings.listTopLevelCapabilityNames(table);
    const selectable = names.filter((name) =>
      AUTO_CAPABILITIES.some((expected) => name.includes(expected)),
    );
    expect(selectable.length, 'At least one autopilot capability should be listed').toBeGreaterThan(
      0,
    );

    let selectedAtLeastOne = false;
    for (const name of selectable) {
      await settings.clearAutoCapabilitySelection();
      const selected = await settings.selectAutoCapability(name);
      if (!selected) {
        continue;
      }
      selectedAtLeastOne = true;
      await expect(settings.selectedCapabilitiesCount()).toBeVisible();
      expect(
        await settings.isInstallSelectedEnabled(),
        `Install selected should enable after selecting "${name}"`,
      ).toBe(true);
    }
    expect(
      selectedAtLeastOne,
      'At least one Not installed autopilot capability should be selectable',
    ).toBe(true);

    await settings.clearAutoCapabilitySelection();
    let multiSelected = 0;
    for (const name of selectable) {
      if (await settings.selectAutoCapability(name)) {
        multiSelected += 1;
      }
    }
    expect(multiSelected, 'Should select one or more installable capabilities').toBeGreaterThan(0);
    await expect(settings.selectedCapabilitiesCount()).toContainText(/\d+\s+selected/i);
    expect(
      await settings.isInstallSelectedEnabled(),
      'Install selected should stay enabled with installable rows selected',
    ).toBe(true);

    // CTA wiring only — do not click Install selected (cluster-mutating).
    await settings.clearAutoCapabilitySelection();
    expect(await settings.isInstallSelectedEnabled()).toBe(false);
  });

  test('Search filters the automatic capabilities list', async ({
    virtualizationSettingsPage: settings,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

    const table = settings.autoCapabilitiesTable();
    await expect(table).toBeVisible();
    await settings.waitForAutoCapabilitiesReady();

    await settings.searchAutoCapabilities('Migrate');
    await expect(settings.capabilitiesSearchInput()).toHaveValue('Migrate');
    await expect(settings.capabilityRow(table, /Migrate VMs/i)).toBeVisible();
    await expect(settings.capabilityRow(table, /Load balancing/i)).toBeHidden();
    await expect(settings.capabilityRow(table, /Virtualization dashboards/i)).toBeHidden();

    await settings.clearAutoCapabilitiesSearch();
    await expect(settings.capabilityRow(table, /Load balancing/i)).toBeVisible();
    await expect(settings.capabilityRow(table, /Migrate VMs/i)).toBeVisible();
  });
});
