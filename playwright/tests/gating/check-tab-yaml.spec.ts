/**
 * Check all virtualization pages can be loaded.
 * Mirrors: cypress/tests/gating/check-tab-yaml.cy.ts
 */
import { byTestId } from 'utils/locators';

import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';
import { ocIgnore } from '../../utils/oc';

const NS = env.testNamespace;
const DEFAULT_VM_NAME = `${NS}-example`;
const RHEL9 = 'rhel9-server-small';
const EXAMPLE = 'example';
const MINUTE = 60_000;
const SECOND = 1_000;

test.describe.configure({ mode: 'serial' });

test.describe('Check all virtualization pages can be loaded', () => {
  test.beforeAll(() => {
    if (!NS) return;
    for (const cmd of [
      `delete template ${EXAMPLE} -n ${NS} --ignore-not-found`,
      `delete virtualmachineclusterinstancetype ${EXAMPLE} --ignore-not-found`,
      `delete virtualmachineinstancetype ${EXAMPLE} -n ${NS} --ignore-not-found`,
      `delete datasource ${EXAMPLE} -n ${NS} --ignore-not-found`,
      `delete datavolume ${EXAMPLE} -n ${NS} --ignore-not-found`,
      `delete migrationpolicy ${EXAMPLE} --ignore-not-found`,
    ]) {
      ocIgnore(cmd);
    }
  });

  // ── VirtualMachines page ────────────────────────────────────────────────────

  test('start example vm', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    // Give up to 60s — the VM may have just been created and the UI needs time to load it
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, 60_000),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}" — run setup first`,
    ).toBe(true);

    await vmList.openVM(DEFAULT_VM_NAME);
    await vmDetails.clickStart();

    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await dialog.getByRole('button', { name: 'Start' }).click();
    }
    await page.waitForTimeout(MINUTE);
  });

  test('check the status of example vm', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, 30_000),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(DEFAULT_VM_NAME);
    // Wait for the VM details page to load before switching tabs
    await expect(page.locator('h1').getByText(DEFAULT_VM_NAME)).toBeVisible({ timeout: 30_000 });
    await vmDetails.goToTab('Overview');
    await vmDetails.expectOverviewStatus('Running', 5 * MINUTE);
  });

  test('vm tabs are loaded', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, 30_000),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);
    await vmList.openVM(DEFAULT_VM_NAME);

    await expect(page.getByText('Hostname')).toBeVisible();

    await vmDetails.goToTab('Metrics');
    await expect(page.getByText('Utilization')).toBeVisible();

    await vmDetails.goToTab('YAML');
    await expect(page.getByText('Download')).toBeVisible();

    await vmDetails.goToTab('Events');
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();

    await vmDetails.goToTab('Console');
    await expect(page.getByText('Guest login credentials')).toBeVisible({ timeout: 2 * MINUTE });

    await vmDetails.goToTab('Snapshots');
    await expect(page.getByText('No snapshots found')).toBeVisible();

    await vmDetails.goToTab('Diagnostics');
    await expect(page.getByText('Status conditions')).toBeVisible();

    await vmDetails.goToDiagnosticsSubTab('guest-system-log');
    await expect(page.getByText('Guest system log')).toBeVisible();

    await vmDetails.goToConfigSubTab('details');
    await expect(page.getByText('Headless mode')).toBeVisible();

    await vmDetails.goToConfigSubTab('storage');
    await expect(page.getByText('rootdisk')).toBeVisible();

    await vmDetails.goToConfigSubTab('network');
    await expect(page.getByText('Pod networking')).toBeVisible();

    await vmDetails.goToConfigSubTab('scheduling');
    await expect(page.getByText('Scheduling and resource requirements')).toBeVisible();

    await vmDetails.goToConfigSubTab('ssh');
    await expect(page.getByText('SSH access')).toBeVisible();

    await vmDetails.goToConfigSubTab('initial');
    await expect(page.getByText('Cloud-init').first()).toBeVisible();

    await vmDetails.goToConfigSubTab('metadata');
    await expect(page.getByText('Annotations', { exact: true }).first()).toBeVisible();
  });

  test('vmi tabs are loaded', async ({ page, vmDetails, vmList }) => {
    await vmList.navigateToVMList(NS);
    expect(
      await vmList.waitForRow(DEFAULT_VM_NAME, 60_000),
      `VM "${DEFAULT_VM_NAME}" not found in namespace "${NS}"`,
    ).toBe(true);

    // Ensure VM is running (needed when test runs in isolation)
    await vmList.openVM(DEFAULT_VM_NAME);
    if (await vmDetails.isStartVisible()) {
      await vmDetails.clickStart();
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await dialog.getByRole('button', { name: 'Start' }).click();
      }
      await vmDetails.expectOverviewStatus('Running', 5 * MINUTE);
    }

    await vmDetails.goToTab('Overview');
    await expect(page.getByText('VirtualMachineInstance').first()).toBeVisible();
    await byTestId(page, DEFAULT_VM_NAME).click();

    await expect(page.getByText('Annotations', { exact: true }).first()).toBeVisible();

    await vmDetails.goToTab('YAML');
    await expect(page.getByText('Download')).toBeVisible();

    await vmDetails.goToTab('Scheduling');
    await expect(page.getByText('Tolerations', { exact: true }).first()).toBeVisible();

    await vmDetails.goToTab('Events');
    await expect(page.getByText('Streaming events...')).toBeVisible();

    await vmDetails.goToTab('Console');
    await expect(page.getByText('Guest login credentials')).toBeVisible();

    await vmDetails.goToTab('Network interfaces');
    await expect(page.getByText('Pod networking')).toBeVisible();

    await vmDetails.goToTab('Disks');
    await expect(page.getByText('rootdisk')).toBeVisible();
  });

  // ── Templates page ──────────────────────────────────────────────────────────

  test('common template tabs are loaded', async ({ page, templatesPage, vmDetails }) => {
    await templatesPage.navigate(); // all-namespaces
    await templatesPage.filterByName(RHEL9);
    await templatesPage.openTemplate(RHEL9);

    await expect(page.getByText('Display name')).toBeVisible();
    await expect(page.getByText('not editable')).toBeVisible();

    await vmDetails.goToTab('YAML');
    await expect(page.getByText('Download')).toBeVisible();

    await vmDetails.goToTab('Scheduling');
    await expect(page.getByText('Tolerations', { exact: true }).first()).toBeVisible();

    await vmDetails.goToTab('Network interfaces');
    await expect(page.getByText('Pod networking')).toBeVisible();

    await vmDetails.goToTab('Disks');
    await expect(page.getByText('rootdisk')).toBeVisible();

    await vmDetails.goToTab('Scripts');
    await expect(page.getByText('Cloud-init').first()).toBeVisible();

    await vmDetails.goToTab('Parameters');
    await expect(page.getByRole('heading', { name: 'Parameters' })).toBeVisible();
  });

  test('create example template', async ({ page, templatesPage }) => {
    await templatesPage.navigate(NS);
    await templatesPage.createFromYAML();
    await templatesPage.save();
  });

  test('custom template tabs are loaded', async ({ page, templatesPage, vmDetails }) => {
    await templatesPage.navigate(NS);
    await templatesPage.openTemplate(EXAMPLE);

    await expect(page.getByText('Display name')).toBeVisible();

    await vmDetails.goToTab('YAML');
    await expect(page.getByText('Download')).toBeVisible();

    await vmDetails.goToTab('Network interfaces');
    await expect(page.getByText('Pod networking')).toBeVisible();

    await vmDetails.goToTab('Disks');
    await expect(page.getByText('rootdisk')).toBeVisible();

    await vmDetails.goToTab('Scripts');
    await expect(page.getByText('Cloud-init').first()).toBeVisible();

    await vmDetails.goToTab('Parameters');
    await expect(page.getByRole('heading', { name: 'Parameters' })).toBeVisible();
  });

  // ── InstanceTypes page ──────────────────────────────────────────────────────

  test('instanceTypes page is loaded', async ({ instanceTypesPage, page }) => {
    await instanceTypesPage.navigate();
    await expect(page.getByText('cx1.2xlarge', { exact: true })).toBeVisible();
  });

  test('create VirtualMachineClusterInstanceType from YAML', async ({ instanceTypesPage }) => {
    await instanceTypesPage.navigate();
    await instanceTypesPage.createFromYAML();
    await instanceTypesPage.save();
    await instanceTypesPage.backToBreadcrumb();
    await instanceTypesPage.filterByName(EXAMPLE);
    await instanceTypesPage.expectItemVisible(EXAMPLE);
    await instanceTypesPage.expectItemNotVisible('cx1.2xlarge');
  });

  test('create VirtualMachineInstanceType from YAML', async ({ instanceTypesPage }) => {
    await instanceTypesPage.navigate();
    await instanceTypesPage.clickUserTab();
    await instanceTypesPage.switchProject(NS);
    await instanceTypesPage.createFromYAML();
    await instanceTypesPage.save();
    await instanceTypesPage.backToBreadcrumb();
    await instanceTypesPage.expectItemVisible(EXAMPLE);
  });

  // ── Bootable volumes page ───────────────────────────────────────────────────

  test('bootable volume page is loaded', async ({ bootableVolumesPage, page }) => {
    await bootableVolumesPage.navigate();
    await expect(byTestId(page, 'fedora')).toBeVisible();
  });

  test('create bootable volume from YAML', async ({ bootableVolumesPage }) => {
    await bootableVolumesPage.navigate(NS);
    await bootableVolumesPage.createFromYAML();
    await bootableVolumesPage.save();
    await bootableVolumesPage.expectItemVisible(EXAMPLE);
  });

  // ── MigrationPolicies page ──────────────────────────────────────────────────

  test('migration policy page is loaded', async ({ migrationPoliciesPage }) => {
    await migrationPoliciesPage.navigate();
    await migrationPoliciesPage.expectEmptyState('No MigrationPolicies found');
  });

  test('create migration policy from YAML', async ({ migrationPoliciesPage }) => {
    await migrationPoliciesPage.navigate();
    await migrationPoliciesPage.createFromYAML();
    await migrationPoliciesPage.save();
    await migrationPoliciesPage.backToBreadcrumb();
    await migrationPoliciesPage.expectItemVisible(EXAMPLE);
  });

  // ── Checkups page ───────────────────────────────────────────────────────────

  test('storage checkup page is loaded', async ({ checkupsPage }) => {
    await checkupsPage.navigate();
    await checkupsPage.openStorageTab();
    await checkupsPage.expectNoStorageCheckups();
  });
});
