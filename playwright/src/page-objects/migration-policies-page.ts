import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class MigrationPoliciesPage extends ResourceListPage {
  readonly listPath = '/k8s/all-namespaces/migrations.kubevirt.io~v1alpha1~MigrationPolicy';

  createMigrationPolicyButton(): Locator {
    return this.page.getByRole('button', { name: /Create MigrationPolicy/i }).first();
  }

  editPolicyModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit migrationpolicy/i });
  }

  editLabelsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit labels/i });
  }

  namespaceSelectorOwnerText(): Locator {
    return this.page.getByText('owner', { exact: false }).first();
  }

  async goToList(): Promise<void> {
    await this.gotoList(this.listPath);
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown(/Create MigrationPolicy/i);
    await this.createFromYamlAndSubmit(manifestYaml);
    const detailUrl = /migrations\.kubevirt\.io~v1alpha1~MigrationPolicy\/[^/]+(?:\/|$|#)/;
    await this.waitForResourceDetailUrl(detailUrl, TestTimeouts.RESOURCE_CREATION).catch(
      async () => {
        // Import YAML sometimes returns to the list instead of opening the detail page.
        await this.goToList();
      },
    );
  }

  migrationPolicyDetailName(name: string): Locator {
    return this.page.getByRole('definition').filter({ hasText: name }).first();
  }

  isOnMigrationPolicyDetail(name: string): boolean {
    return /MigrationPolicy\/[^/]+/.test(this.page.url()) && this.page.url().includes(name);
  }

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

  async openDetail(name: string): Promise<void> {
    await this.page.goto(`/k8s/cluster/migrations.kubevirt.io~v1alpha1~MigrationPolicy/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async getDetailTitleText(): Promise<string> {
    return await this.getResourceTitleText();
  }

  async editFromList(name: string): Promise<void> {
    await this.openRowActions(name);
    await this.page.getByRole('menuitem', { name: /^Edit$/i }).click();
  }

  async saveEditModal(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
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

  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }
}
