/**
 * Utility functions for optimized waiting strategies in Playwright tests.
 * Provides helpers for element text, visibility, stability, and condition-based waits.
 */

import type { Locator, Page } from '@playwright/test';

import { TestTimeouts } from './test-config';

export async function waitForElementText(
  locator: Locator,
  expectedText: string,
  timeout: number = TestTimeouts.STATUS_VALIDATION,
): Promise<boolean> {
  try {
    await locator.filter({ hasText: expectedText }).first().waitFor({
      state: 'visible',
      timeout,
    });
    return true;
  } catch {
    // If not found, check all elements for the text
    try {
      const allTexts = await locator.allTextContents();
      return allTexts.some((text) => text.includes(expectedText));
    } catch {
      return false;
    }
  }
}

export async function waitForAnyElementText(
  locators: Locator[],
  expectedText: string,
  timeout: number = TestTimeouts.STATUS_VALIDATION,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    for (const locator of locators) {
      try {
        const text = await locator.textContent({ timeout: TestTimeouts.POLLING_INTERVAL });
        if (text && text.includes(expectedText)) {
          return true;
        }
      } catch {
        // Continue to next locator
      }
    }

    await new Promise((resolve) => setTimeout(resolve, TestTimeouts.UI_DELAY_SHORT));
  }

  return false;
}

/**
 * Wait for an API response matching the pattern.
 * Does NOT fail the test if the response is not detected - continues gracefully.
 *
 * @param page - Playwright page
 * @param urlPattern - URL pattern to match (string or RegExp)
 * @param expectedStatus - Expected HTTP status code (default: 200)
 * @param timeout - Timeout in milliseconds (default: TestTimeouts.DEFAULT)
 * @returns true if response was detected, false if timeout
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus = 200,
  timeout: number = TestTimeouts.DEFAULT,
): Promise<boolean> {
  const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;

  try {
    await page.waitForResponse(
      (response) => {
        const urlMatches = pattern.test(response.url());
        const statusMatches = response.status() === expectedStatus;
        return urlMatches && statusMatches;
      },
      { timeout },
    );
    return true;
  } catch {
    // Response not detected within timeout - continue gracefully without failing test
    return false;
  }
}

export async function waitForElementStable(
  locator: Locator,
  timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });

  // More efficient than a fixed timeout: compare bounding boxes for animation settling
  const boundingBox1 = await locator.boundingBox().catch(() => null);
  await new Promise((resolve) => setTimeout(resolve, TestTimeouts.UI_DELAY_MICRO));
  const boundingBox2 = await locator.boundingBox().catch(() => null);

  if (
    boundingBox1 &&
    boundingBox2 &&
    (boundingBox1.x !== boundingBox2.x || boundingBox1.y !== boundingBox2.y)
  ) {
    await new Promise((resolve) => setTimeout(resolve, 2 * TestTimeouts.UI_DELAY_MICRO));
  }
}

export async function waitForAllElementsVisible(
  locators: Locator[],
  timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
): Promise<void> {
  await Promise.all(locators.map((locator) => locator.waitFor({ state: 'visible', timeout })));
}

export async function waitForNavigationComplete(
  page: Page,
  elementSelector: string,
  timeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
): Promise<void> {
  await page.waitForSelector(elementSelector, { state: 'visible', timeout });
}

export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = TestTimeouts.DEFAULT as number,
  pollInterval: number = TestTimeouts.UI_DELAY_SHORT as number,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      if (await condition()) {
        return true;
      }
    } catch {
      // Ignore errors, continue polling
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return false;
}

/**
 * Page health check result
 */
export interface PageHealthStatus {
  /** Whether the page is considered healthy and ready */
  isHealthy: boolean;
  /** DOM content loaded */
  domLoaded: boolean;
  /** Network is relatively idle */
  networkSettled: boolean;
  /** Memory pressure is acceptable (if available) */
  memoryOk: boolean;
  /** JS heap size in MB (if available) */
  jsHeapSizeMB?: number;
  /** Memory pressure level: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown' */
  memoryPressure: string;
  /** Any warning messages */
  warnings: string[];
}

/**
 * Dynamic wait strategy with page health check.
 * Waits for the page to be fully loaded and ensures browser memory pressure is acceptable.
 *
 * This helps prevent tests from proceeding when the browser is under heavy load,
 * which could cause flakiness.
 *
 * @param page - Playwright page
 * @param options - Configuration options
 * @returns PageHealthStatus with details about page health
 */
export async function waitForPageHealthy(
  page: Page,
  options: {
    /** Maximum JS heap size in MB before warning (default: 500MB) */
    maxHeapSizeMB?: number;
    /** Timeout for waiting (default: 30s) */
    timeout?: number;
    /** Whether to wait for network idle (default: true) */
    waitForNetworkIdle?: boolean;
    /** Whether to check memory pressure (default: true) */
    checkMemory?: boolean;
    /** Poll interval in ms (default: 500ms) */
    pollInterval?: number;
  } = {},
): Promise<PageHealthStatus> {
  const {
    maxHeapSizeMB = 500,
    timeout = TestTimeouts.DEFAULT,
    waitForNetworkIdle = true,
    checkMemory = true,
    pollInterval: pollIntervalMs = TestTimeouts.UI_DELAY_SHORT,
  } = options;
  const pollInterval: number = pollIntervalMs;

  const warnings: string[] = [];
  let domLoaded = false;
  let networkSettled = false;
  let memoryOk = true;
  let jsHeapSizeMB: number | undefined;
  let memoryPressure = 'unknown';

  const startTime = Date.now();

  try {
    await page.waitForLoadState('domcontentloaded', {
      timeout: Math.min(timeout, TestTimeouts.NAVIGATION),
    });
    domLoaded = true;
  } catch {
    warnings.push('DOM content load timeout - continuing anyway');
  }

  try {
    await page.waitForLoadState('load', {
      timeout: Math.max(0, timeout - (Date.now() - startTime)),
    });
  } catch {
    warnings.push('Page load timeout - continuing anyway');
  }

  if (waitForNetworkIdle) {
    try {
      await page.waitForLoadState('networkidle', {
        timeout: Math.min(
          TestTimeouts.UI_VISIBILITY_QUICK,
          Math.max(0, timeout - (Date.now() - startTime)),
        ),
      });
      networkSettled = true;
    } catch {
      // Network idle timeout is common with polling pages - not a failure
      networkSettled = true; // Consider it settled if timeout
    }
  } else {
    networkSettled = true;
  }

  if (checkMemory) {
    try {
      const memoryInfo = await page.evaluate(() => {
        const result: {
          jsHeapSizeMB?: number;
          pressure?: string;
        } = {};

        const perf = performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        };

        if (perf.memory) {
          result.jsHeapSizeMB = Math.round(perf.memory.usedJSHeapSize / 1024 / 1024);
        }

        return result;
      });

      jsHeapSizeMB = memoryInfo.jsHeapSizeMB;

      if (jsHeapSizeMB !== undefined) {
        if (jsHeapSizeMB < maxHeapSizeMB * 0.5) {
          memoryPressure = 'nominal';
        } else if (jsHeapSizeMB < maxHeapSizeMB * 0.75) {
          memoryPressure = 'fair';
        } else if (jsHeapSizeMB < maxHeapSizeMB) {
          memoryPressure = 'serious';
          warnings.push(`High memory usage: ${jsHeapSizeMB}MB`);
        } else {
          memoryPressure = 'critical';
          memoryOk = false;
          warnings.push(`Critical memory usage: ${jsHeapSizeMB}MB (threshold: ${maxHeapSizeMB}MB)`);
        }
      }
    } catch {
      // Memory check not available - not a failure
      memoryPressure = 'unknown';
    }

    if (!memoryOk) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval * 2));

      try {
        const recheck = await page.evaluate(() => {
          const perf = performance as Performance & {
            memory?: { usedJSHeapSize: number };
          };
          return perf.memory ? Math.round(perf.memory.usedJSHeapSize / 1024 / 1024) : undefined;
        });

        if (recheck !== undefined && recheck < maxHeapSizeMB) {
          memoryOk = true;
          jsHeapSizeMB = recheck;
          memoryPressure = recheck < maxHeapSizeMB * 0.75 ? 'fair' : 'serious';
          warnings.push(`Memory recovered to ${recheck}MB after wait`);
        }
      } catch {
        // Ignore recheck errors
      }
    }
  }

  const isHealthy = domLoaded && networkSettled && memoryOk;

  return {
    isHealthy,
    domLoaded,
    networkSettled,
    memoryOk,
    jsHeapSizeMB,
    memoryPressure,
    warnings,
  };
}

/**
 * Wait for page to be healthy with retry logic.
 * Will retry up to maxRetries times if page is unhealthy due to memory pressure.
 *
 * @param page - Playwright page
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param retryDelayMs - Delay between retries in ms (default: 2000)
 * @returns true if page became healthy, false otherwise
 */
export async function waitForPageHealthyWithRetry(
  page: Page,
  maxRetries = 3,
  retryDelayMs: number = TestTimeouts.RETRY_DELAY,
): Promise<boolean> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const health = await waitForPageHealthy(page);

    if (health.isHealthy) {
      return true;
    }

    if (attempt < maxRetries) {
      // Log retry attempt (will show in Playwright trace)
      console.log(
        `Page health check failed (attempt ${attempt + 1}/${maxRetries + 1}): ` +
          `memory=${health.memoryPressure}, heap=${health.jsHeapSizeMB}MB. Retrying...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return false;
}
