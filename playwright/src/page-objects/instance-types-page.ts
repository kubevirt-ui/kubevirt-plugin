import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { fillLabelsModalInput } from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

const instancetypeConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

export class InstanceTypesPage extends ResourceListPage {
  readonly userListPath = ConsoleRoutes.userInstanceTypesInNamespace('');

  clusterTab(): Locator {
    return this.page.getByRole('tab', { name: /Cluster InstanceTypes/i });
  }

  userTab(): Locator {
    return this.page.getByRole('tab', { name: /User InstanceTypes/i });
  }

  instanceTypesListTitle(): Locator {
    return this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /InstanceTypes/i });
  }

  instanceTypeSizeMenuItem(name: RegExp): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  instancetypeDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('VirtualMachineInstancetype', name);
  }

  async waitForClusterListReady(): Promise<void> {
    await waitForConsoleRouteReady(
      this.page,
      ConsoleRoutes.clusterInstanceTypes(),
      this.instanceTypesListTitle(),
      'Cluster VirtualMachineClusterInstancetype list',
    );
  }

  async waitForUserListReady(namespace: string): Promise<void> {
    await waitForConsoleRouteReady(
      this.page,
      ConsoleRoutes.userInstanceTypesInNamespace(namespace),
      this.instanceTypesListTitle(),
      'Namespace VirtualMachineInstancetype list',
    );
  }

  async goToUserList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.userInstanceTypesInNamespace(namespace));
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /InstanceTypes/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  async goToClusterList(): Promise<void> {
    await this.gotoList(ConsoleRoutes.clusterInstanceTypes());
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /InstanceTypes/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown(/Create VirtualMachineInstancetype|Create/i);
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(
      new RegExp(
        `${instancetypeConsoleSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}~VirtualMachineInstancetype/[^/]+(?:/|$)`,
      ),
    );
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  async openDetail(namespace: string, name: string): Promise<void> {
    await this.page.goto(
      `/k8s/ns/${namespace}/${instancetypeConsoleSegment}~VirtualMachineInstancetype/${name}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.resourceTitle().waitFor({ state: 'visible' });
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    const labelsButton = this.page.getByRole('button', { name: /^Labels$/ });
    await labelsButton.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    const editButton = labelsButton
      .locator('xpath=following-sibling::button[normalize-space()="Edit"]')
      .or(
        this.page
          .getByRole('heading', { name: /VirtualMachineInstancetype details/i })
          .locator('xpath=ancestor::*[1]')
          .getByRole('button', { name: /^Edit$/i })
          .first(),
      );
    await editButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(editButton.first());
    await fillLabelsModalInput(this.page, label);
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  private detailActionsButton(): Locator {
    return this.page
      .locator('.co-actions button')
      .filter({ hasText: /^Actions$/ })
      .or(this.page.getByRole('button', { name: 'Actions' }).last());
  }

  /** Console CRD detail uses `.co-actions`; list rows use KubeVirt `ActionsDropdown` (see `deleteFromList`). */
  async openDeleteDialog(_name: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.detailActionsButton().click({ timeout: TestTimeouts.ELEMENT_WAIT });
    const deleteAction = this.page
      .getByRole('button', { name: /Delete VirtualMachineInstancetype/i })
      .or(this.page.getByTestId('instacetype-delete-action'))
      .or(this.page.getByRole('menuitem', { name: /^Delete$/i }));
    await deleteAction.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await deleteAction.first().click();
  }

  private instancetypeDeleteConfirmationDialog(): Locator {
    return this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .or(
        this.page
          .getByRole('dialog')
          .filter({ visible: true })
          .filter({
            has: this.page.getByRole('heading', { name: /Delete VirtualMachineInstancetype/i }),
          }),
      )
      .first();
  }

  async confirmDelete(_resourceName?: string): Promise<void> {
    const deleteModal = this.instancetypeDeleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const submit = deleteModal
      .getByTestId('save-button')
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }));
    await this.robustClick(submit.first());
    await deleteModal.waitFor({ state: 'hidden', timeout: 2 * MINUTE });
  }

  /**
   * List row Popper menus are flaky in headless runs; open the resource from the filtered row,
   * then delete from the detail Actions menu (console + KubeVirt both expose Delete there).
   */
  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    await this.nameLink(name).click();
    await this.waitForResourceDetailUrl(this.instancetypeDetailUrlPattern(name));
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }
}
