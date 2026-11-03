import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

const instancetypeConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

export class InstanceTypesPage extends ResourceListPage {
  readonly userListPath = ConsoleRoutes.userInstanceTypesInNamespace('');

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

  clusterTab(): Locator {
    return this.page.getByRole('tab', { name: /Cluster InstanceTypes/i });
  }

  async confirmDelete(): Promise<void> {
    const deleteModal = this.instancetypeDeleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const submit = deleteModal
      .getByTestId('save-button')
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }));
    await this.robustClick(submit.first());
    await deleteModal.waitFor({ state: 'hidden', timeout: 2 * MINUTE });
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.ensureUserInstanceTypesTabSelected();
    await dismissConsoleObstructions(this.page);
    const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
    const onYamlEditor =
      /VirtualMachineInstancetype\/~new/i.test(this.page.url()) ||
      (await this.page
        .locator('.monaco-editor')
        .first()
        .isVisible()
        .catch(() => false));

    if (!onYamlEditor) {
      try {
        await this.openCreateDropdown(
          /Create VirtualMachineInstancetype|Create VirtualMachineInstanceType|^Create$/i,
        );
      } catch {
        if (!namespace) {
          throw new Error('InstanceType YAML create: no namespace in URL and create menu failed');
        }
        await this.page.goto(
          `/k8s/ns/${namespace}/${instancetypeConsoleSegment}~VirtualMachineInstancetype/~new`,
          { waitUntil: 'domcontentloaded' },
        );
      }
    }
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(
      new RegExp(
        `${instancetypeConsoleSegment.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        )}~VirtualMachineInstancetype/[^/]+(?:/|$)`,
      ),
    );
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    await this.openDeleteDialog(name);
    await this.confirmDelete();
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await openResourceLabelsEditor(this.page);
    await fillLabelsModalInput(this.page, label);
  }

  async ensureUserInstanceTypesTabSelected(): Promise<void> {
    const userTab = this.page.getByRole('tab', { name: /User provided|User InstanceTypes/i });
    if (await userTab.isVisible().catch(() => false)) {
      await this.robustClick(userTab);
    }
  }

  async goToClusterList(): Promise<void> {
    await this.gotoList(ConsoleRoutes.clusterInstanceTypes());
    await this.listPageHeading(/InstanceTypes/i).waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  async goToUserList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.userInstanceTypesInNamespace(namespace));
    await this.listPageHeading(/InstanceTypes/i).waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  instanceTypeSizeMenuItem(name: RegExp): Locator {
    return this.page.getByRole('menuitem', { name });
  }

  instanceTypesListTitle(): Locator {
    return this.listPageHeading(/InstanceTypes/i);
  }

  instancetypeDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('VirtualMachineInstancetype', name);
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  async openDetail(namespace: string, name: string): Promise<void> {
    await this.page.goto(
      `/k8s/ns/${namespace}/${instancetypeConsoleSegment}~VirtualMachineInstancetype/${name}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.resourceTitle().waitFor({ state: 'visible' });
    await this.page
      .getByRole('heading', { name: /VirtualMachineInstancetype details/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  userTab(): Locator {
    return this.page.getByRole('tab', { name: /User provided|User InstanceTypes/i });
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
}
