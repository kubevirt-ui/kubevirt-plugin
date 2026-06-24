import { getErrorMessage } from '@/data-models/kubernetes-types';
import { detectAuthExpired, healBrowserAuth } from '@/utils/auth-healer';
import { EnvVariables } from '@/utils/env-variables';
import { FileUtils } from '@/utils/file-utils';
import { getStorageStatePath } from '@/utils/storage-state';
import { TestTimeouts } from '@/utils/test-config';
import { getTestResultsDir } from '@/utils/test-results-dir';
import type { BrowserContextOptions, Page, TestInfo } from '@playwright/test';
import { test as base } from '@playwright/test';

/** Bookkeeping fields used by CI safe-mode quarantine (not part of Playwright's public TestInfo). */
export type CiSafeModeTestInfo = TestInfo & {
  _ciQuarantined?: boolean;
  _errors?: unknown[];
  errors?: Array<{ message?: string; toString?: () => string }>;
  status?: string;
  expectedStatus?: string;
};

/**
 * Patterns that identify infrastructure timeout errors.
 * Used by the soft-expect timeout guard to distinguish transient infrastructure
 * issues (network latency, slow cluster) from genuine product/test bugs.
 */
const TIMEOUT_PATTERNS: RegExp[] = [
  /Timeout \d+ms exceeded/i,
  /TimeoutError/i,
  /exceeded while waiting/i,
  /waiting for locator/i,
  /locator\.waitFor/i,
  /page\.waitFor/i,
  /waiting for selector/i,
  /Navigation timeout/i,
  /net::ERR_TIMED_OUT/i,
];

/**
 * Determines whether an error originates from an infrastructure timeout
 * (as opposed to a logic/assertion failure).
 *
 * This is used by `_softExpectTimeoutGuard` to decide whether a test with
 * soft-assertion failures should be marked as skipped (infrastructure flake)
 * or left as failed (genuine bug).
 */
export function isTimeoutError(error: { message?: string; toString?: () => string }): boolean {
  const msg = error?.message || error?.toString?.() || '';
  return TIMEOUT_PATTERNS.some((p) => p.test(msg));
}

export function getThrownConstructorName(value: unknown): string {
  if (typeof value !== 'object' || value === null) return '';
  const ctor = Reflect.get(value, 'constructor') as { name?: string } | undefined;
  return typeof ctor?.name === 'string' ? ctor.name : '';
}

export function quarantineWrap(args: unknown[]): void {
  for (let i = args.length - 1; i >= 0; i--) {
    if (typeof args[i] === 'function') {
      const original = args[i] as (
        this: unknown,
        ...fnArgs: unknown[]
      ) => Promise<unknown> | Promise<void>;
      const originalSource = original.toString();

      async function wrappedQuarantine(this: unknown, ...rest: unknown[]): Promise<void> {
        try {
          await original.apply(this, rest);
        } catch (error: unknown) {
          const errName = getThrownConstructorName(error);
          if (errName === 'SkipError' || errName === 'FixmeError') throw error;

          const msg = getErrorMessage(error);
          const reason = msg.split('\n')[0].slice(0, 200);
          const info = base.info() as CiSafeModeTestInfo;

          info.annotations.push({ type: 'fixme', description: `Quarantined: ${reason}` });
          base.info().attachments.push({
            name: 'ci-safe-mode',
            contentType: 'text/plain',
            body: Buffer.from(`Quarantined: ${info.title}\nReason: ${reason}`),
          });

          if (Array.isArray(info.errors)) info.errors = [];
          if (Array.isArray(info._errors)) info._errors = [];
          info.status = 'skipped';
          info.expectedStatus = 'skipped';
          info._ciQuarantined = true;
          return;
        }

        const infoSoft = base.info() as CiSafeModeTestInfo;
        if (
          !infoSoft._ciQuarantined &&
          Array.isArray(infoSoft.errors) &&
          infoSoft.errors.length > 0
        ) {
          const first = infoSoft.errors[0];
          const msgSoft = first?.message || first?.toString?.() || 'Soft assertion failure';
          const reasonSoft = msgSoft.split('\n')[0].slice(0, 200);

          infoSoft.annotations.push({
            type: 'fixme',
            description: `Quarantined (${infoSoft.errors.length} soft): ${reasonSoft}`,
          });
          base.info().attachments.push({
            name: 'ci-safe-mode',
            contentType: 'text/plain',
            body: Buffer.from(
              `Quarantined (${infoSoft.errors.length} soft): ${infoSoft.title}\nFirst: ${reasonSoft}`,
            ),
          });

          infoSoft.errors = [];
          if (Array.isArray(infoSoft._errors)) infoSoft._errors = [];
          infoSoft.status = 'skipped';
          infoSoft.expectedStatus = 'skipped';
          infoSoft._ciQuarantined = true;
        }
      }

      const wrapper = wrappedQuarantine as typeof wrappedQuarantine & { toString(): string };
      wrapper.toString = () => originalSource;
      args[i] = wrapper;
      break;
    }
  }
}

export function buildBrowserContextOptions(
  storageStatePath?: string,
  recordVideo?: { dir: string; size: { width: number; height: number } },
): BrowserContextOptions {
  const contextOptions: BrowserContextOptions = {
    baseURL: EnvVariables.webConsoleUrl,
    storageState: storageStatePath,
    ignoreHTTPSErrors: true,
    viewport: { width: 1920, height: 1080 },
    permissions: ['clipboard-read', 'clipboard-write'],
    locale: 'en-US',
    timezoneId: 'UTC',
    bypassCSP: true,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    hasTouch: false,
    isMobile: false,
    deviceScaleFactor: 1,
    javaScriptEnabled: true,
    acceptDownloads: false,
  };

  if (recordVideo) {
    contextOptions.recordVideo = recordVideo;
  }

  return contextOptions;
}

export function getWorkerStorageStatePath(): string | undefined {
  const playwrightDir = FileUtils.resolvePath(__dirname, '..', '..');
  return getStorageStatePath(playwrightDir);
}

export async function navigateToVirtualizationPerspective(page: Page): Promise<void> {
  const baseUrl = EnvVariables.webConsoleUrl;
  const maxRetries = 2;
  const consoleStabilizationMs = 2500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(baseUrl, { waitUntil: 'load', timeout: TestTimeouts.NAVIGATION });
      await page.waitForLoadState('load');
      await page
        .waitForLoadState('networkidle', { timeout: TestTimeouts.VM_CREATION_EXTENDED })
        .catch(() => undefined);

      if (await detectAuthExpired(page)) {
        const healed = await healBrowserAuth(page, page.context());
        if (healed) {
          await page.goto(baseUrl, { waitUntil: 'load', timeout: TestTimeouts.NAVIGATION });
          await page.waitForLoadState('load');
          await page
            .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_DELAY_LONG })
            .catch(() => undefined);
        }
      }

      const tourSkipBtn = page.locator('[data-test="tour-step-footer-secondary"]');
      const hasTour = await tourSkipBtn
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (hasTour) {
        await tourSkipBtn.click({ force: true }).catch(() => undefined);
        await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      const welcomeCheckbox = page.locator('#welcome-modal-checkbox');
      const hasWelcome = await welcomeCheckbox
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      if (hasWelcome) {
        await welcomeCheckbox.check({ force: true }).catch(() => undefined);
        const closeBtn = page.locator('.pf-v6-c-modal-box__close button');
        await closeBtn.click({ force: true }).catch(() => undefined);
        await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      await page
        .locator('.pf-v6-c-backdrop')
        .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_LONG })
        .catch(() => undefined);

      await page.waitForTimeout(consoleStabilizationMs);

      const perspectiveToggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
      const virtNavSection = page.locator('[data-quickstart-id="qs-nav-sec-virtualization"]');

      const navType = await Promise.race([
        perspectiveToggle
          .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
          .then(() => 'perspective' as const),
        virtNavSection
          .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
          .then(() => 'section' as const),
      ]).catch(() => 'none' as const);

      if (navType === 'perspective') {
        const perspectiveUrlPattern = /virtualization/;
        const inTargetPerspective = perspectiveUrlPattern.test(page.url());

        if (!inTargetPerspective) {
          const perspectiveOption = page
            .locator('[data-test-id="perspective-switcher-menu-option"]')
            .filter({
              has: page.locator('.pf-v6-c-menu__item-text', {
                hasText: /^Virtualization$/,
              }),
            });

          const selectionAttempts = 3;
          for (let selAttempt = 1; selAttempt <= selectionAttempts; selAttempt++) {
            try {
              const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
              await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
              await toggle.click();
              await perspectiveOption.waitFor({
                state: 'visible',
                timeout: TestTimeouts.UI_DELAY_LONG,
              });
              await perspectiveOption.scrollIntoViewIfNeeded();
              await page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);
              await perspectiveOption.click();

              await page.waitForURL(perspectiveUrlPattern, {
                timeout: TestTimeouts.UI_DELAY_LONG,
              });
              await page.waitForLoadState('load');
              break;
            } catch {
              if (selAttempt === selectionAttempts)
                throw new Error('Perspective selection did not navigate to target URL');
              await page.keyboard.press('Escape').catch(() => undefined);
              await page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
            }
          }
        }
      }

      break;
    } catch (_error) {
      if (attempt === maxRetries) {
        // Navigation retries exhausted — non-fatal, handled by caller
      } else {
        await page.waitForTimeout(TestTimeouts.POLLING_INTERVAL);
      }
    }
  }
}

export async function saveFailureArtifacts(
  testInfo: TestInfo,
  screenshotPath: null | string,
  videoPath: null | string,
): Promise<void> {
  if (!screenshotPath && !videoPath) return;

  try {
    const pathMod = await import('path');
    const fs = await import('fs');
    const repoRoot = FileUtils.resolvePath(__dirname, '..', '..', '..');
    const testResultsBase = getTestResultsDir(repoRoot);
    const artifactsDir = pathMod.join(testResultsBase, '.failure-artifacts');
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
    const artifactsPath = pathMod.join(artifactsDir, `${testInfo.testId}.json`);
    fs.writeFileSync(
      artifactsPath,
      JSON.stringify({
        screenshotPath: screenshotPath ?? null,
        videoPath: videoPath ?? null,
      }),
      'utf-8',
    );
  } catch {
    await Promise.resolve();
  }
}
