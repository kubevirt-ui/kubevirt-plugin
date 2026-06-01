import { expect, Locator, Page } from '@playwright/test';

import { NAV_TIMEOUT, SECOND, SHORT_TIMEOUT } from '../utils/constants';
import { env } from '../utils/env';

const NAV_SIDEBAR = '.pf-v6-c-page__sidebar';
const NAV_COLLAPSED_CLASS = 'pf-m-collapsed';
const NAV_TOGGLE_BUTTON = '#nav-toggle';
const AUTO_HIDE_TOGGLE = 'auto-hide-nav';
const CONFIGMAP_PATCH_URL = 'configmaps/kubevirt-user-settings';

export class NavAutoHidePage {
  readonly createButton: Locator;
  readonly hamburger: Locator;
  readonly overviewTab: Locator;
  readonly sidebar: Locator;
  readonly vmListTab: Locator;

  constructor(private readonly page: Page) {
    this.sidebar = page.locator(NAV_SIDEBAR);
    this.hamburger = page.locator(NAV_TOGGLE_BUTTON);
    this.vmListTab = page.locator('[data-test="vm-list-tab"]');
    this.overviewTab = page.locator('[data-test="overview-tab"]');
    this.createButton = page.locator('[data-test="item-create"]');
  }

  private async navigateToAutoHideToggle() {
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`, {
      waitUntil: 'networkidle',
    });
    await this.page.getByRole('tab', { exact: true, name: 'User' }).click();

    const generalSection = this.page.getByRole('button').filter({ hasText: 'General' });
    await expect(generalSection).toBeVisible({ timeout: SHORT_TIMEOUT });
    const expanded = await generalSection
      .evaluate((el) => el.getAttribute('aria-expanded') === 'true')
      .catch(() => false);
    if (!expanded) {
      await generalSection.click();
      await expect(generalSection).toHaveAttribute('aria-expanded', 'true', {
        timeout: SHORT_TIMEOUT,
      });
    }
  }

  /** Wait for the plugin to have rendered (confirms module federation loaded). */
  private async waitForPluginRender() {
    await expect(this.overviewTab).toBeVisible({ timeout: NAV_TIMEOUT });
  }

  /**
   * Wait for the ConfigMap PATCH to complete after toggling the switch.
   * This ensures the setting is persisted before navigating away.
   */
  private async waitForSettingsPatch() {
    await this.page.waitForResponse(
      (resp) => resp.url().includes(CONFIGMAP_PATCH_URL) && resp.request().method() === 'PATCH',
      { timeout: SHORT_TIMEOUT },
    );
  }

  async clickVmListTab() {
    await expect(this.vmListTab).toBeVisible({ timeout: SHORT_TIMEOUT });
    await this.vmListTab.click();
    await expect(this.createButton).toBeVisible({ timeout: NAV_TIMEOUT });
  }

  async disableAutoHide() {
    await this.navigateToAutoHideToggle();
    const toggle = this.page.locator(`[data-test-id="${AUTO_HIDE_TOGGLE}"]`);
    await expect(toggle).toBeVisible({ timeout: SHORT_TIMEOUT });

    if (await toggle.isChecked()) {
      const patchDone = this.waitForSettingsPatch();
      await toggle.locator('..').click();
      await expect(toggle).not.toBeChecked({ timeout: SHORT_TIMEOUT });
      await patchDone;
    }
  }

  async enableAutoHide() {
    await this.navigateToAutoHideToggle();
    const toggle = this.page.locator(`[data-test-id="${AUTO_HIDE_TOGGLE}"]`);
    await expect(toggle).toBeVisible({ timeout: SHORT_TIMEOUT });

    if (!(await toggle.isChecked())) {
      const patchDone = this.waitForSettingsPatch();
      await toggle.locator('..').click();
      await expect(toggle).toBeChecked({ timeout: SHORT_TIMEOUT });
      await patchDone;
    }
  }

  async expandNav() {
    await this.hamburger.click();
    await this.expectNavExpanded();
  }

  /**
   * Assert the sidebar is collapsed. The auto-hide hook depends on an async chain
   * (module federation → operator namespace resolution → ConfigMap watch → effect).
   * If the hook loses the race on the first load, a reload gives it another chance
   * with all modules cached.
   */
  async expectNavCollapsed(timeout = NAV_TIMEOUT) {
    const checkCollapsed = async (t: number) =>
      expect(async () => {
        await expect(this.sidebar).toHaveClass(new RegExp(NAV_COLLAPSED_CLASS), {
          timeout: 2 * SECOND,
        });
      }).toPass({ intervals: [500, 1000], timeout: t });

    try {
      await checkCollapsed(timeout);
    } catch {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await expect(this.sidebar).toBeVisible({ timeout: SHORT_TIMEOUT });
      await checkCollapsed(timeout);
    }
  }

  /**
   * Assert the sidebar is NOT collapsed. Uses not.toHaveClass for resilience.
   */
  async expectNavExpanded(timeout = NAV_TIMEOUT) {
    await expect(async () => {
      await expect(this.sidebar).not.toHaveClass(new RegExp(NAV_COLLAPSED_CLASS), {
        timeout: 2 * SECOND,
      });
    }).toPass({ intervals: [500, 1000], timeout });
  }

  /**
   * Navigate to the VM page and wait for the plugin to render.
   * Uses domcontentloaded instead of networkidle because the plugin's module
   * federation chunks load lazily after the initial page network settles.
   */
  async goto(namespace?: string) {
    const nsPath = namespace ? `ns/${namespace}` : 'all-namespaces';
    await this.page.goto(`/k8s/${nsPath}/kubevirt.io~v1~VirtualMachine`, {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForPluginRender();
  }

  /**
   * Navigate to a VM detail page. Tries to find a link in the DOM first,
   * falls back to fetching a VM name via the K8s API.
   */
  async gotoVMDetail(namespace?: string): Promise<boolean> {
    const nsPath = namespace ? `ns/${namespace}` : 'all-namespaces';

    await expect(this.createButton).toBeVisible({ timeout: NAV_TIMEOUT });

    const vmDetailLink = this.page
      .locator(`a[href*="${nsPath}/kubevirt.io~v1~VirtualMachine/"]`)
      .first();
    const hasLink = await vmDetailLink.isVisible({ timeout: SHORT_TIMEOUT }).catch(() => false);

    if (hasLink) {
      await vmDetailLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    }

    if (!namespace) return false;

    const vmName = await this.page.evaluate(async (ns) => {
      const resp = await fetch(
        `/api/kubernetes/apis/kubevirt.io/v1/namespaces/${ns}/virtualmachines?limit=1`,
      );
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.items?.[0]?.metadata?.name ?? null;
    }, namespace);

    if (!vmName) return false;

    await this.page.goto(`/k8s/${nsPath}/kubevirt.io~v1~VirtualMachine/${vmName}`, {
      waitUntil: 'domcontentloaded',
    });
    return true;
  }

  /**
   * Warm up a fresh browser context by visiting the settings page first.
   * This ensures module federation chunks are cached and the operatorNamespace
   * signal is resolved before navigating to the VM page. Mimics real user
   * behavior where the plugin is already loaded from prior navigation.
   */
  async warmup() {
    await this.page.goto(`/k8s/ns/${env.cnvNamespace}/virtualization-settings`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForLoadState('networkidle');
  }
}
