import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BasePage from '../base-page';

export default class QuotasPage extends BasePage {
  private readonly _aHasTextLearnMoreAboutManagingVMQuotasWithAAQ = this.locator(
    'a:has-text("Learn more about managing VM quotas with AAQ")',
  );

  private readonly _createButton = this.testId('item-create');
  private readonly _pageHeading = this.testId('page-heading').locator('h1');
  private readonly _roleMenuitemHasTextWithForm = this.locator(
    '[role="menuitem"]:has-text("With form")',
  );
  constructor(page: Page) {
    super(page);
  }

  async clickCancelOnForm(): Promise<void> {
    const cancelBtn = this.locator('main button:has-text("Cancel")');
    await cancelBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(cancelBtn);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  async clickCreateQuota(): Promise<void> {
    await this._createButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(this._createButton);
    await this.page.waitForTimeout(500);
  }

  async clickCreateWithForm(): Promise<void> {
    const formOption = this._roleMenuitemHasTextWithForm;
    await formOption.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(formOption);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async deleteQuotaFromList(quotaName: string): Promise<void> {
    const kebab = this.locator(`tr:has-text("${quotaName}")`)
      .getByTestId('actions-dropdown')
      .locator('button');
    await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(kebab);
    await this.page.waitForTimeout(500);

    const deleteOption = this.locator('[role="menuitem"]:has-text("Delete quota")');
    await deleteOption.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(deleteOption.first());
    await this.page.waitForTimeout(500);

    const confirmBtn = this.testId('save-button').filter({ hasText: 'Delete' });
    await confirmBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(confirmBtn);
    await this.page.waitForTimeout(2000);
  }

  async fillMemoryAllocation(value: string): Promise<void> {
    const input = this.locator('input[placeholder="i.e., 16"]');
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await input.fill(value);
  }

  async fillQuotaName(name: string): Promise<void> {
    const nameInput = this.locator('#quota-name');
    await nameInput.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await nameInput.fill(name);
  }

  async fillVcpuAllocation(value: string): Promise<void> {
    const input = this.locator('input[placeholder="i.e., 8"]');
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await input.fill(value);
  }

  async fillVmiLimits(value: string): Promise<void> {
    const input = this.locator('input[placeholder="i.e., 4"]');
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await input.fill(value);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getDocumentationLinkHref(): Promise<string | null> {
    try {
      const docLink = this._aHasTextLearnMoreAboutManagingVMQuotasWithAAQ;
      await docLink.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await docLink.first().getAttribute('href');
    } catch {
      return null;
    }
  }

  async isCreateQuotaSubmitDisabled(): Promise<boolean> {
    const submitBtn = this.locator('main button:has-text("Create quota")');
    try {
      await submitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return await submitBtn.isDisabled();
    } catch {
      return true;
    }
  }

  async isDocumentationLinkVisible(): Promise<boolean> {
    try {
      const docLink = this._aHasTextLearnMoreAboutManagingVMQuotasWithAAQ;
      await docLink.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async navigateToNamespaceQuotas(namespace: string): Promise<void> {
    await this.goTo(`/k8s/ns/${namespace}/quotas`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async navigateToQuotasViaUI(): Promise<void> {
    const quotasNav = this.locator('nav a[href*="/quotas"]');
    await quotasNav.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await this.robustClick(quotasNav.first());
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async submitCreateQuota(): Promise<void> {
    const submitBtn = this.locator('main button:has-text("Create quota"):not([disabled])');
    await submitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    await this.robustClick(submitBtn);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  async verifyCreateButtonVisible(): Promise<boolean> {
    try {
      await this._createButton.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyCreateDropdownOptions(): Promise<{ withForm: boolean; withYaml: boolean }> {
    try {
      const formOption = this._roleMenuitemHasTextWithForm;
      const yamlOption = this.locator('[role="menuitem"]:has-text("With YAML")');

      const withForm = await formOption
        .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);
      const withYaml = await yamlOption
        .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);

      return { withForm, withYaml };
    } catch {
      return { withForm: false, withYaml: false };
    }
  }

  async verifyCreateFormHeadingVisible(): Promise<boolean> {
    try {
      const heading = this.locator('h1:has-text("Create application-aware quota")');
      await heading.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyEmptyStateGuidanceVisible(): Promise<boolean> {
    try {
      const guidance = this.locator(
        'text=/create.*application-aware quota|application-aware quota.*limit/i',
      );
      await guidance.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyEmptyStateVisible(): Promise<boolean> {
    try {
      const emptyHeading = this.locator(
        ':is(h4, h5, [class*="empty-state"]):has-text("application-aware quota")',
      );
      await emptyHeading.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyFormFieldsVisible(): Promise<{
    name: boolean;
    project: boolean;
    vcpu: boolean;
    memory: boolean;
    vmiLimits: boolean;
  }> {
    const check = async (text: string) => {
      try {
        const label = this.locator(`main label:has-text("${text}"), main :text("${text}")`);
        await label.first().waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
        return true;
      } catch {
        return false;
      }
    };

    return {
      name: await check('Name'),
      project: await check('Project'),
      vcpu: await check('vCPU allocation'),
      memory: await check('Virtual memory allocation'),
      vmiLimits: await check('VMI limits'),
    };
  }

  async verifyFormViewSelected(): Promise<boolean> {
    try {
      const formRadio = this.testId('form-view-input');
      return await formRadio.isChecked();
    } catch {
      return false;
    }
  }

  async verifyOnQuotasListPage(): Promise<boolean> {
    return this.page.url().includes('/quotas') && !this.page.url().includes('~new');
  }

  async verifyPageHeadingVisible(): Promise<boolean> {
    try {
      await this._pageHeading.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const text = await this._pageHeading.textContent();
      return text?.includes('Application-aware quotas') ?? false;
    } catch {
      return false;
    }
  }

  async verifyQuotaInList(quotaName: string): Promise<boolean> {
    try {
      const row = this.locator(`a:has-text("${quotaName}")`);
      await row.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }
}
