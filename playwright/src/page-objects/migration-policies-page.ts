import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class MigrationPoliciesPage extends ResourceListPage {
  readonly listPath = '/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MigrationPolicy';

  async createFromForm(name: string): Promise<void> {
    await this.page.goto('/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/form', {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .getByRole('heading', { name: /Create MigrationPolicy/i })
      .waitFor({ state: 'visible' });
    const nameInput = this.page.locator('.migration-policy__form-body input[type="text"]').first();
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown(/Create MigrationPolicy/i);
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(
      /migrations\.kubevirt\.io~v1alpha1~MigrationPolicy\/[^/]+(?:\/|$|#)/,
    );
  }

  createMigrationPolicyButton(): Locator {
    return this.page.getByRole('button', { name: /Create MigrationPolicy/i }).first();
  }

  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }

  async editFromList(name: string): Promise<void> {
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: /^Edit$/i }).click();
  }

  editLabelsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit labels/i });
  }

  async editNamespaceSelectorLabels(label: string): Promise<void> {
    await this.page
      .locator('.migration-policy-description-item-header')
      .filter({ hasText: /Project labels/i })
      .getByRole('button', { name: 'Edit' })
      .click();
    await this.page.locator('#tags-input, [data-test="tags-input"]').fill(label);
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  editPolicyModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit migrationpolicy/i });
  }

  async getDetailTitleText(): Promise<string> {
    return await this.getResourceTitleText();
  }

  async goToList(): Promise<void> {
    await this.gotoList(this.listPath);
  }

  isOnMigrationPolicyDetail(name: string): boolean {
    return /MigrationPolicy\/[^/]+/.test(this.page.url()) && this.page.url().includes(name);
  }

  migrationPolicyDetailName(name: string): Locator {
    return this.page.getByRole('definition').filter({ hasText: name }).first();
  }

  namespaceSelectorOwnerText(): Locator {
    return this.page.getByText('owner', { exact: false }).first();
  }

  async openDetail(name: string): Promise<void> {
    await this.page.goto(`/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async saveEditModal(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
