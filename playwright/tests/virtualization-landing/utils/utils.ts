import RequestContextClient from '@/clients/request-context-client';
import NavigationComponent from '@/components/shared/navigation-component';
import { KubernetesResource } from '@/data-models/kubernetes-types';
import { EnvVariables } from '@/utils/env-variables';
import { SECOND, TestTimeouts } from '@/utils/test-config';
import { expect, Page } from '@playwright/test';

export const SUITE = 'Welcome Modal';
const WELCOME_MODAL_LOCATOR = '[data-test="welcome-modal"]';
const WELCOME_MODAL_CHECKBOX_LOCATOR = '[id="welcome-modal-checkbox"]';
export const CLOSE_BUTTON_LOCATOR = '[aria-label="Welcome modal"] .pf-v6-c-modal-box__close button';
export const ONBOARDING_POPOVER_LOCATOR = '[data-test="onboarding-popover"]';
const TOUR_STEP_COUNTER_LOCATOR = '[data-test="tour-step-counter"]';
const TOUR_HEADER_LOCATOR = '[data-test="tour-popover-header"]';
const TOUR_NEXT_BUTTON_LOCATOR = '[data-test="tour-next-btn"]';
const TOUR_STEPS_COUNT = 8;

export const verifyWelcomeModalVisibility = async (
  page: Page,
  expectVisible: boolean,
  timeout = SECOND,
) => {
  const modal = page.locator(WELCOME_MODAL_LOCATOR);
  if (expectVisible) {
    await modal.waitFor({ state: 'visible', timeout });
  }
  const visible = await modal.isVisible();
  expect(visible, 'Welcome modal should be visible').toBe(expectVisible);
};

export const resetUserSettings = async (apiClient: RequestContextClient) => {
  const user: KubernetesResource | null = await apiClient.getResource(
    'user.openshift.io',
    'v1',
    'users',
    '~',
  );

  const settingsKey =
    user?.metadata?.uid || user?.metadata?.name?.replace(/[^-._a-zA-Z0-9]+/g, '-');

  if (!settingsKey) return;

  const userSettingsCm = await apiClient.getKubeVirtUserSettings(EnvVariables.cnvNamespace);
  const cmData = (userSettingsCm?.data ?? {}) as Record<string, string>;

  if (!(settingsKey in cmData)) return;

  const parsed = JSON.parse(cmData[settingsKey] || '{}');
  parsed.quickStart = { ...parsed.quickStart, dontShowWelcomeModal: false, tourStepsSeen: [] };

  await apiClient.patchConfigMap('kubevirt-user-settings', EnvVariables.cnvNamespace, [
    { op: 'replace', path: `/data/${settingsKey}`, value: JSON.stringify(parsed) },
  ]);
};

export const getTourTotalSteps = async (page: Page): Promise<number> => {
  const stepCounter = page.locator(TOUR_STEP_COUNTER_LOCATOR);
  await stepCounter.waitFor({ state: 'visible', timeout: SECOND });
  const text = (await stepCounter.textContent()) ?? '';
  const match = text.match(/\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const enterVirtualMachinesPage = async (page: Page, nav: NavigationComponent) => {
  await nav.clickNavVirtualMachines();
  await page.waitForLoadState('load');
  await verifyWelcomeModalVisibility(page, true, TestTimeouts.SHORT_WAIT);
};

export const checkIfModalIsVisibleAfterCheckboxClick = async (page: Page) => {
  const patchPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('kubevirt-user-settings') &&
      (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
      resp.status() >= 200 &&
      resp.status() < 300,
    { timeout: TestTimeouts.SHORT_WAIT },
  );

  await page.locator(WELCOME_MODAL_CHECKBOX_LOCATOR).click({ force: true });

  const patchResponse = await patchPromise.catch(() => null);
  expect(
    patchResponse,
    'User settings should be patched with dontShowWelcomeModal: true',
  ).not.toBeNull();

  await verifyWelcomeModalVisibility(page, true);
};

export const tourStepsTest = async (page: Page) => {
  // Wait for the tour popover to appear (Joyride needs target elements to be in DOM)
  await page
    .locator('[data-test="tour-popover"]')
    .waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });

  const totalSteps = await getTourTotalSteps(page);
  expect(totalSteps, 'Tour should report step count').toBe(TOUR_STEPS_COUNT);

  const tourHeader = page.locator(TOUR_HEADER_LOCATOR);
  const nextButton = page.locator(TOUR_NEXT_BUTTON_LOCATOR);
  const stepTitles: string[] = [];

  for (let i = 0; i < totalSteps; i++) {
    await tourHeader.waitFor({ state: 'visible', timeout: TestTimeouts.SHORT_WAIT });
    const title = (await tourHeader.textContent())?.trim() ?? '';
    stepTitles.push(title);

    const hasNext = await nextButton.isVisible().catch(() => false);
    if (hasNext) {
      await nextButton.click();
      await page.waitForTimeout(SECOND);
    }
  }

  expect(stepTitles.length, `Tour should have ${totalSteps} steps`).toBe(totalSteps);

  const okayButton = page.locator('[data-test="tour-next-btn"]:has-text("Okay, got it!")');
  if (await okayButton.isVisible().catch(() => false)) {
    await okayButton.click();
    await page.waitForTimeout(SECOND);
  }
};

export const expendSidebarIfCollapsed = async (page: Page) => {
  const sidebar = page.locator('.pf-v6-c-page__sidebar');
  const isCollapsed = await sidebar
    .evaluate((el) => el.classList.contains('pf-m-collapsed'))
    .catch(() => false);
  if (isCollapsed) {
    const navToggle = page.locator(
      '#nav-toggle, button.pf-v6-c-masthead__toggle, .pf-v6-c-masthead__toggle button',
    );
    await navToggle.first().click();
    await page.waitForTimeout(500);
  }
};
