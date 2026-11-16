/**
 * s390x mock utilities for Playwright tests.
 *
 * On non-s390x clusters, these helpers intercept the two API surfaces the
 * kubevirt-plugin reads to determine cluster architecture and override them so
 * the UI behaves as if it is running on an IBM Z (s390x) cluster:
 *
 * 1. HCO GET/LIST/WATCH — injects `status.nodeInfo.workloadsArchitectures: ['s390x']`
 * 2. `window.SERVER_FLAGS.nodeArchitectures` — overridden via page.evaluate after
 *    each navigation so wizard Template-catalog filters initialise with 's390x'
 * 3. Template LIST responses — adds `template.kubevirt.io/architecture: s390x` to
 *    non-Windows templates so the architecture filter panel shows the s390x checkbox
 *
 * Usage (optional helper when exercising arch-sensitive UI on a non-s390x cluster):
 *   await applyS390xMocks(page);   // before navigation
 *   await cleanupS390xMocks(page); // after test
 *
 * Prefer regular gating/tier specs with `EnvVariables.isS390x` branches — there is
 * no dedicated s390x Playwright project. VM lifecycle still needs a real s390x cluster.
 */

import type { Page, Route } from '@playwright/test';

const WINDOWS_TEMPLATE_PREFIXES = ['windows', 'win2k', 'win10', 'win11'];

const S390X_ARCH = 's390x';
const ARCHITECTURE_LABEL = 'template.kubevirt.io/architecture';

const HCO_URL_PATTERN = '**/apis/hco.kubevirt.io/v1beta1/**/hyperconvergeds/**';
const TEMPLATES_URL_PATTERN = '**/apis/template.openshift.io/v1/**/templates*';

function isWindowsTemplate(name: string): boolean {
  const lower = name.toLowerCase();
  return WINDOWS_TEMPLATE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

async function handleHcoRoute(route: Route): Promise<void> {
  try {
    const response = await route.fetch();
    const body = await response.json().catch(() => null);

    if (body && typeof body === 'object') {
      const items: unknown[] = Array.isArray((body as Record<string, unknown>).items)
        ? ((body as Record<string, unknown>).items as unknown[])
        : [body];

      for (const item of items) {
        const resource = item as Record<string, unknown>;
        if (!resource.status) resource.status = {};
        const status = resource.status as Record<string, unknown>;
        if (!status.nodeInfo) status.nodeInfo = {};
        const nodeInfo = status.nodeInfo as Record<string, unknown>;
        nodeInfo.workloadsArchitectures = [S390X_ARCH];
      }

      const merged =
        (body as Record<string, unknown>).items !== undefined
          ? { ...(body as object), items }
          : items[0];

      await route.fulfill({
        status: response.status(),
        headers: Object.fromEntries(Object.entries(response.headers())),
        body: JSON.stringify(merged),
      });
      return;
    }
  } catch {
    // Fall through to passthrough on any error
  }
  await route.continue();
}

async function handleTemplatesRoute(route: Route): Promise<void> {
  const url = route.request().url();
  if (url.includes('watch=true')) {
    await route.continue();
    return;
  }

  try {
    const response = await route.fetch();
    const body = await response.json().catch(() => null);

    if (body && typeof body === 'object') {
      const items: unknown[] | null = Array.isArray((body as Record<string, unknown>).items)
        ? ((body as Record<string, unknown>).items as unknown[])
        : null;

      if (items) {
        for (const item of items) {
          const template = item as Record<string, unknown>;
          const metadata = template.metadata as Record<string, unknown> | undefined;
          if (!metadata) continue;

          const name = String(metadata.name ?? '');
          if (!isWindowsTemplate(name)) {
            if (!metadata.labels) metadata.labels = {};
            (metadata.labels as Record<string, string>)[ARCHITECTURE_LABEL] = S390X_ARCH;
          }
        }

        await route.fulfill({
          status: response.status(),
          headers: Object.fromEntries(Object.entries(response.headers())),
          body: JSON.stringify({ ...(body as object), items }),
        });
        return;
      }
    }
  } catch {
    // Fall through
  }
  await route.continue();
}

export async function injectServerFlagsS390x(page: Page): Promise<void> {
  await page
    .evaluate((arch: string) => {
      const flags = (window as unknown as { SERVER_FLAGS?: Record<string, unknown> }).SERVER_FLAGS;
      if (flags) {
        flags.nodeArchitectures = [arch];
      }
    }, S390X_ARCH)
    .catch(() => {
      // Page may not have SERVER_FLAGS yet if called too early — harmless
    });
}

export async function applyS390xMocks(page: Page): Promise<void> {
  await page.route(HCO_URL_PATTERN, handleHcoRoute);
  await page.route(TEMPLATES_URL_PATTERN, handleTemplatesRoute);
}

export async function cleanupS390xMocks(page: Page): Promise<void> {
  await page.unroute(HCO_URL_PATTERN).catch(() => undefined);
  await page.unroute(TEMPLATES_URL_PATTERN).catch(() => undefined);
}
