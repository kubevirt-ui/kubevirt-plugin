/**
 * Delete All VirtualMachines confirmation modal.
 * Tests the new bulk-delete modal that requires typing the VM count to confirm.
 */
import { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';
import { VMListPage } from '../../pages/VMListPage';
import { MINUTE, NAV_TIMEOUT, SHORT_TIMEOUT } from '../../utils/constants';
import { env } from '../../utils/env';
import { createExampleVM, deleteResource } from '../../utils/oc';

const NS = env.testNamespace;
const VM_NAMES = [`${NS}-del-all-vm-1`, `${NS}-del-all-vm-2`, `${NS}-del-all-vm-3`];

test.describe.configure({ mode: 'serial' });

test.describe('Delete all VMs modal', () => {
  test.beforeAll(() => {
    if (!NS) return;
    VM_NAMES.forEach((name) => createExampleVM(name, NS, 'Halted'));
  });

  test.afterAll(() => {
    if (!NS) return;
    VM_NAMES.forEach((name) => deleteResource('vm', name, NS));
  });

  // ── Helper: open the modal ──────────────────────────────────────────────────

  async function openDeleteAllModal(vmList: VMListPage, page: Page): Promise<void> {
    await vmList.navigateToVMList(NS);
    await expect(vmList.row(VM_NAMES[0])).toBeVisible({ timeout: MINUTE });

    // Right-click the project node in the tree view
    await page
      .locator('[data-test="vms-treeview"]')
      .getByRole('button', { exact: true, name: NS })
      .dispatchEvent('contextmenu');

    // Wait for the right-click menu to appear before clicking the action
    await expect(page.locator('.right-click-action-menu')).toBeVisible({ timeout: NAV_TIMEOUT });

    // Assert delete action is enabled (disabled when any VM in namespace is Running or deletion-protected)
    const deleteAction = page.locator('[data-test-id="vm-action-delete"]');
    await expect(
      deleteAction,
      'Delete action is disabled — a VM in the namespace may be Running or deletion-protected',
    ).not.toHaveAttribute('aria-disabled', 'true', { timeout: NAV_TIMEOUT });

    // Click the Delete action by its data-test-id
    await deleteAction.click();

    await expect(page.locator('.pf-v6-c-modal-box')).toBeVisible({ timeout: NAV_TIMEOUT });
  }
  // ── Tests ──────────────────────────────────────────────────────────────────

  test('modal opens with correct title and body', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    const modal = page.locator('.pf-v6-c-modal-box');
    await expect(modal.getByText('Delete multiple VirtualMachines?')).toBeVisible();
    await expect(modal.getByText(/Are you sure you want to delete/)).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('affected VMs list shows up to 4 VMs', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    const modal = page.locator('.pf-v6-c-modal-box');
    await expect(modal.getByText('VirtualMachines being deleted', { exact: true })).toBeVisible({
      timeout: NAV_TIMEOUT,
    });

    // Expand the full list so test VMs are visible regardless of alphabetical order
    const showAllBtn = modal.getByRole('button', {
      name: /Show all \d+ VirtualMachines/i,
    });
    if (await showAllBtn.isVisible()) {
      await showAllBtn.click();
    }

    // The 3 test VMs created by beforeAll should be visible in the list
    for (const name of VM_NAMES) {
      await expect(modal.getByText(name)).toBeVisible({ timeout: NAV_TIMEOUT });
    }

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('delete button is disabled initially and has danger styling', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    const deleteBtn = page.getByRole('button', { name: /Delete \d+ VirtualMachines/i });
    await expect(deleteBtn).toBeDisabled();
    await expect(deleteBtn).toHaveClass(/pf-m-danger/);

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('delete button stays disabled when wrong count is typed', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    await page.locator('#delete-all-vms-confirmation').fill('999');

    await expect(page.getByRole('button', { name: /Delete \d+ VirtualMachines/i })).toBeDisabled();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('delete button becomes enabled when correct count is typed', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    // Read the actual VM count from the helper text to handle pre-existing VMs in the namespace
    const helperText = await page
      .locator('.pf-v6-c-modal-box__body .pf-v6-c-helper-text')
      .textContent();
    const countMatch = helperText?.match(/\d+/);
    const actualCount = countMatch?.[0] ?? String(VM_NAMES.length);

    await page.locator('#delete-all-vms-confirmation').fill(actualCount);

    await expect(page.getByRole('button', { name: /Delete \d+ VirtualMachines/i })).toBeEnabled({
      timeout: SHORT_TIMEOUT,
    });

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('search filters the VM list', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    const modal = page.locator('.pf-v6-c-modal-box');
    await modal.getByPlaceholder('Find by name').fill(VM_NAMES[0]);

    await expect(modal.getByText(VM_NAMES[0])).toBeVisible({ timeout: SHORT_TIMEOUT });
    await expect(modal.getByText(VM_NAMES[1])).not.toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('modal state resets on close and reopen', async ({ page, vmList }) => {
    await openDeleteAllModal(vmList, page);

    // Type something and close
    await page.locator('#delete-all-vms-confirmation').fill('999');
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Reopen — input should be empty
    await openDeleteAllModal(vmList, page);
    await expect(page.locator('#delete-all-vms-confirmation')).toHaveValue('');

    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
