import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

const preferenceConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

/** Cluster OS preferences are listed under this namespace for non-admin console users. */
const CLUSTER_OS_PREFERENCES_PROJECT = 'openshift-virtualization-os-images';

export class PreferencesPage extends ResourceListPage {
  private detailActionsButton(): Locator {
    return this.page
      .locator('.co-actions button')
      .filter({ hasText: /^Actions$/ })
      .or(this.page.getByRole('button', { name: 'Actions' }).last());
  }

  private preferenceDeleteConfirmationDialog(): Locator {
    return this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .or(
        this.page
          .getByRole('dialog')
          .filter({ visible: true })
          .filter({
            has: this.page.getByRole('heading', {
              name: /Delete VirtualMachineClusterPreference/i,
            }),
          }),
      )
      .first();
  }

  commonOsPreferenceRow(): Locator {
    return this.row(/rhel|fedora|centos/i).first();
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown(/Create VirtualMachineClusterPreference|Create/i);
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(
      new RegExp(
        `${preferenceConsoleSegment.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        )}~VirtualMachineClusterPreference/[^/]+(?:/|$)`,
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
    await this.nameLink(name).click();
    await this.waitForResourceDetailUrl(this.preferenceDetailUrlPattern(name));
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await dismissConsoleObstructions(this.page);
    await this.robustClick(this.detailActionsButton());
    const deleteAction = this.page
      .getByTestId('preference-delete-action')
      .or(this.page.getByRole('button', { name: /Delete VirtualMachineClusterPreference/i }))
      .or(this.page.getByRole('menuitem', { name: /^Delete$/i }));
    await deleteAction.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(deleteAction.first());
    const deleteModal = this.preferenceDeleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(
      deleteModal
        .getByTestId('save-button')
        .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
        .first(),
    );
    await deleteModal.waitFor({ state: 'hidden', timeout: 2 * MINUTE });
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await openResourceLabelsEditor(this.page);
    await fillLabelsModalInput(this.page, label);
  }

  async goToClusterList(): Promise<void> {
    await this.gotoList(ConsoleRoutes.clusterPreferences());
    await this.preferencesListTitle().waitFor({ timeout: TestTimeouts.LONG_OPERATION });
    await this.openClusterPreferencesFromProjectPickerIfNeeded();
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  /** Non-priv users land on a project picker instead of the all-namespaces preference list. */
  async openClusterPreferencesFromProjectPickerIfNeeded(): Promise<void> {
    const projectGrid = this.page.getByRole('grid', { name: 'Projects' });
    if (!(await projectGrid.isVisible().catch(() => false))) {
      return;
    }
    await this.robustClick(this.page.getByRole('link', { name: CLUSTER_OS_PREFERENCES_PROJECT }));
    await waitForConsoleRouteReady(
      this.page,
      `/k8s/ns/${CLUSTER_OS_PREFERENCES_PROJECT}/${preferenceConsoleSegment}~VirtualMachineClusterPreference`,
      this.preferencesListTitle(),
      'VirtualMachineClusterPreference list in OS images project',
    );
  }

  async openDetail(name: string): Promise<void> {
    await this.page.goto(
      `/k8s/cluster/${preferenceConsoleSegment}~VirtualMachineClusterPreference/${name}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.resourceTitle().waitFor({ state: 'visible' });
    await this.page
      .getByRole('heading', { name: /VirtualMachineClusterPreference details/i })
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  preferenceDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('VirtualMachineClusterPreference', name);
  }

  preferencesListTitle(): Locator {
    return this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachineClusterPreferences|Preferences/i });
  }

  async waitForClusterListReady(): Promise<void> {
    await waitForConsoleRouteReady(
      this.page,
      ConsoleRoutes.clusterPreferences(),
      this.preferencesListTitle(),
      'Cluster VirtualMachineClusterPreference list',
    );
    await this.openClusterPreferencesFromProjectPickerIfNeeded();
  }
}
