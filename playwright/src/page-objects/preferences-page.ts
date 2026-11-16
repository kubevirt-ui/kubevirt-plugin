import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

const preferenceConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

/** Cluster OS preferences are listed under this namespace for non-admin console users. */
const CLUSTER_OS_PREFERENCES_PROJECT = 'openshift-virtualization-os-images';

export class PreferencesPage extends ResourceListPage {
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
    const search = this.page.getByPlaceholder(/Search by name/i).first();
    if (await search.isVisible().catch(() => false)) {
      const current = (await search.inputValue().catch(() => '')) || '';
      if (!current.includes(name)) {
        await search.fill(name);
        await search.press('Enter');
        await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
      }
    }
    // Dismiss column-management / other overlays that steal the kebab click.
    await this.page.keyboard.press('Escape').catch(() => undefined);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    // openDeleteDialog clicks preference-delete-action (data-test); confirmDelete owns the modal.
    await this.deleteResourceFromList(name);
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
    return this.listPageHeading(/VirtualMachineClusterPreferences|Preferences/i);
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
