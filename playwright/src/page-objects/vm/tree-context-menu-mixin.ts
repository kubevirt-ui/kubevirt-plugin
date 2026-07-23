import type BasePage from '@/page-objects/base-page';
import { TestTimeouts } from '@/utils/test-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = BasePage> = new (...args: any[]) => T;

/**
 * Mixin that adds tree-view right-click and context menu methods.
 * Applied to both VmTreePage and VirtualMachinesPage to eliminate duplication.
 */
export function TreeContextMenuMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    /**
     * Waits until the vms-treeview subtree has been mutation-free for `quietMs`.
     * The tree re-renders multiple times after a click (React + data fetches), and
     * right-clicking during a re-render causes Playwright to resolve the locator to
     * a detached/stale node — which the browser then bubbles up to the cluster row.
     */
    private async waitForTreeStable(quietMs = 300): Promise<void> {
      await this.page.waitForFunction(
        (quiet) =>
          new Promise<boolean>((resolve) => {
            const tree = document.querySelector('[data-test="vms-treeview"]');
            if (!tree) {
              resolve(true);
              return;
            }
            let timer: ReturnType<typeof setTimeout> = setTimeout(() => {
              obs.disconnect();
              resolve(true);
            }, quiet);
            const obs = new MutationObserver(() => {
              clearTimeout(timer);
              timer = setTimeout(() => {
                obs.disconnect();
                resolve(true);
              }, quiet);
            });
            obs.observe(tree, { childList: true, subtree: true, attributes: true });
          }),
        quietMs,
        { timeout: TestTimeouts.DEFAULT },
      );
    }

    async clickContextMenuItem(itemIdOrText: string): Promise<void> {
      const menu = this.locator('[role="menu"]').first();
      await menu.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

      const byTestId = menu.getByTestId(itemIdOrText);
      const hasTestId = await byTestId
        .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);

      if (hasTestId) {
        await this.robustClick(byTestId);
        return;
      }

      const byText = menu.getByText(itemIdOrText, { exact: true });
      await byText.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(byText);
    }

    async dismissContextMenu(): Promise<void> {
      const menu = this.locator('[role="menu"]');
      const menuVisible = await menu
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);

      if (!menuVisible) return;

      await this.page.keyboard.press('Escape');
      await menu
        .first()
        .waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});

      const backdrop = this.testId('right-click-backdrop');
      if (await backdrop.isVisible({ timeout: TestTimeouts.SHORT_WAIT }).catch(() => false)) {
        await backdrop.click({ force: true });
        await backdrop
          .waitFor({ state: 'hidden', timeout: TestTimeouts.DEFAULT })
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch(() => {});
      }
    }

    async getTreeViewContextMenuItems(): Promise<
      { testId: string; text: string; disabled: boolean }[]
    > {
      const menuItems = this.locator('[role="menu"] [data-test]');
      await menuItems.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const items = await menuItems.all();
      const result: { testId: string; text: string; disabled: boolean }[] = [];
      for (const item of items) {
        const testId = (await item.getAttribute('data-test')) ?? '';
        const text = (await item.locator('.pf-v6-c-menu__item-text').textContent()) ?? '';
        const disabled = await item.evaluate((el) => el.classList.contains('pf-m-disabled'));
        result.push({ testId, text: text.trim(), disabled });
      }
      return result;
    }

    async rightClickFolderInTreeView(folderName: string, namespace: string): Promise<void> {
      await this.waitForTreeStable();
      // DOM: LI[id="folderSelector/..."] > DIV > DIV#label-selectable > SPAN.node-container > BUTTON.node-text
      const folderButton = this.locator(
        `[id="folderSelector/#single-cluster#/${namespace}/${folderName}"] button.pf-v6-c-tree-view__node-text`,
      );
      await folderButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await folderButton.scrollIntoViewIfNeeded();
      await folderButton.click({ button: 'right' });
      await this.locator('[role="menu"]').first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
    }

    async rightClickNamespaceInTreeView(namespace: string): Promise<void> {
      await this.dismissContextMenu();

      // Step 1: click the cluster node first so the tree is at cluster scope.
      // Use the direct child combinator (> div) to avoid matching namespace buttons
      // inside the nested UL that also lives inside #ALL_NS#.
      const clusterButton = this.locator(
        `[id="#ALL_NS#"] > div button.pf-v6-c-tree-view__node-text`,
      );
      await clusterButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await clusterButton.click();
      await this.waitForTreeStable();

      // Step 2: click the namespace node until the URL confirms the scope has changed.
      // Repeating avoids right-clicking during a React re-render where the locator
      // can still resolve to the cluster row instead of the namespace row.
      // Use direct child combinator to target only the namespace row's own button,
      // not child VM buttons that also match button.pf-v6-c-tree-view__node-text
      // and are nested inside the same projectSelector container.
      const nsButton = this.locator(
        `[id="projectSelector/#single-cluster#/${namespace}"] > div button.pf-v6-c-tree-view__node-text`,
      ).filter({ hasText: namespace });
      await nsButton.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await nsButton.first().scrollIntoViewIfNeeded();

      const expectedUrlSegment = `/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`;
      const deadline = Date.now() + TestTimeouts.DEFAULT;
      while (!this.page.url().includes(expectedUrlSegment)) {
        if (Date.now() > deadline) break;
        await nsButton.first().click();
        await this.waitForTreeStable();
      }

      // Step 3: right-click — tree is now stable and scoped to this namespace.
      await nsButton.first().click({ button: 'right' });
      await this.locator('[role="menu"]').first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.DEFAULT,
      });
    }

    async rightClickVmInTreeView(vmName: string, namespace: string): Promise<void> {
      const vmId = this.locator(`[id="#single-cluster#/${namespace}/${vmName}"]`);
      await vmId.click({ button: 'right' });
    }
  };
}
