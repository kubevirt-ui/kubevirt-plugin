import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import { KUBEVIRT_INSTANCETYPE_API_VERSION } from '@/utils/constants';
import { waitForConsoleRouteReady } from '@/utils/instance-types-policy';
import { pollUntil } from '@/utils/poll-until';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

const instancetypeConsoleSegment = KUBEVIRT_INSTANCETYPE_API_VERSION.replace('/', '~');

export class InstanceTypesPage extends ResourceListPage {
  readonly userListPath = ConsoleRoutes.userInstanceTypesInNamespace('');

  clusterTab(): Locator {
    return this.page.getByRole('tab', { name: /Cluster InstanceTypes/i });
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
      if (namespace) {
        await this.page.goto(
          `/k8s/ns/${namespace}/${instancetypeConsoleSegment}~VirtualMachineInstancetype/~new`,
          { waitUntil: 'domcontentloaded' },
        );
      } else {
        await this.openCreateDropdown(
          /Create VirtualMachineInstancetype|Create VirtualMachineInstanceType|^Create$/i,
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
    await this.ensureUserInstanceTypesTabSelected();
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    await this.deleteResourceFromList(name);
    const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
    if (namespace) {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForUserListReady(namespace);
    }
    await pollUntil(
      async () =>
        !(await this.row(name)
          .isVisible()
          .catch(() => false)),
      {
        message: `InstanceType ${name} should disappear from list after delete`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(() => undefined);
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
