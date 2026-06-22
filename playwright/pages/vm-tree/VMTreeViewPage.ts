import { expect, Locator, Page } from '@playwright/test';

import { MINUTE } from '../../utils/constants';
import { byTest } from '../../utils/locators';

import {
  DISABLED_FILTER_TOOLTIP,
  HIDE,
  NO_VM_PROJECTS_EMPTY_STATE,
  SHOW,
  SHOW_EMPTY_PROJECTS_KEY,
  SHOW_ONLY_VM_PROJECTS_SWITCH,
  SHOW_ONLY_VM_PROJECTS_SWITCH_LABEL,
  SHOW_ONLY_VM_PROJECTS_SWITCH_TARGET,
  SHOW_TREE_VIEW_KEY,
  TREE_VIEW_SEARCH_INPUT,
  VMS_TREEVIEW,
} from './constants';

export class VMTreeViewPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  async expectDisabledFilterTooltip() {
    await expect(this.page.getByRole('tooltip', { name: DISABLED_FILTER_TOOLTIP })).toBeVisible();
  }

  async expectEmptyState(visible: boolean) {
    const emptyState = this.page.getByText(NO_VM_PROJECTS_EMPTY_STATE);
    if (visible) {
      await expect(emptyState).toBeVisible();
      return;
    }
    await expect(emptyState).toBeHidden();
  }

  async expectLoaded() {
    await this.expectVisible();
    await expect(this.showOnlyVMProjectsSwitchLabel()).toBeVisible({ timeout: MINUTE });
  }

  async expectProjectVisible(projectName: string, visible: boolean) {
    const project = this.projectTreeItem(projectName);
    if (visible) {
      await expect(project).toBeVisible();
      return;
    }
    await expect(project).toBeHidden();
  }

  async expectShowOnlyVMProjectsSwitch(checked: boolean, disabled?: boolean) {
    const switchInput = this.showOnlyVMProjectsSwitchInput();
    if (checked) {
      await expect(switchInput).toBeChecked();
    } else {
      await expect(switchInput).not.toBeChecked();
    }

    if (disabled === undefined) return;

    if (disabled) {
      await expect(switchInput).toBeDisabled();
    } else {
      await expect(switchInput).toBeEnabled();
    }
  }

  // ── State setup ─────────────────────────────────────────────────────────────

  async expectVisible() {
    await expect(this.panel()).toBeVisible();
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async hoverShowOnlyVMProjectsSwitch() {
    const target = this.showOnlyVMProjectsSwitchTarget();
    if (await target.count()) {
      await target.hover();
      return;
    }
    await this.showOnlyVMProjectsSwitchLabel().hover({ force: true });
  }

  panel(): Locator {
    return byTest(this.page, VMS_TREEVIEW);
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  projectTreeItem(projectName: string): Locator {
    return this.page.getByRole('treeitem', { name: projectName });
  }

  searchInput(): Locator {
    return this.page.locator(`#${TREE_VIEW_SEARCH_INPUT}`);
  }

  /** Seed localStorage so the tree panel is open and the VM-only filter defaults to ON. */
  async seedDefaultState() {
    await this.page.addInitScript(
      ({ hide, show, showEmptyProjectsKey, showTreeViewKey }) => {
        localStorage.setItem(showEmptyProjectsKey, JSON.stringify(hide));
        localStorage.setItem(showTreeViewKey, JSON.stringify(show));
      },
      {
        hide: HIDE,
        show: SHOW,
        showEmptyProjectsKey: SHOW_EMPTY_PROJECTS_KEY,
        showTreeViewKey: SHOW_TREE_VIEW_KEY,
      },
    );
  }

  async setShowOnlyVMProjectsFilter(enabled: boolean) {
    const switchInput = this.showOnlyVMProjectsSwitchInput();
    const isChecked = await switchInput.isChecked();

    if (enabled === isChecked) return;

    // PatternFly v6 Switch: the toggle span covers the input — click the label wrapper.
    await switchInput.locator('..').click();
  }

  showOnlyVMProjectsSwitchInput(): Locator {
    return this.panel().locator(`[data-test="${SHOW_ONLY_VM_PROJECTS_SWITCH}"]`);
  }

  showOnlyVMProjectsSwitchLabel(): Locator {
    return this.panel().getByRole('switch', { name: SHOW_ONLY_VM_PROJECTS_SWITCH_LABEL });
  }

  showOnlyVMProjectsSwitchTarget(): Locator {
    return byTest(this.page, SHOW_ONLY_VM_PROJECTS_SWITCH_TARGET);
  }

  // Future: expandNode(name), selectProject(name), selectVM(name),
  // searchProjects(query), openPanel(), closePanel()
}
