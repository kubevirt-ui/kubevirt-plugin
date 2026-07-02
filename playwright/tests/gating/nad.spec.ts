/**
 * Network Attachment Definitions.
 * Mirrors: cypress/tests/gating/nad.cy.ts
 */
import { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';
import { CONFIRM_ACTION, KEBAB_BUTTON, SAVE_CHANGES, SECOND } from '../../utils/constants';
import { env } from '../../utils/env';
import { byTest, byTestId } from '../../utils/locators';
import { goto } from '../../utils/nav';
import { deleteResource } from '../../utils/oc';

const NS = env.testNamespace;

const NAD_BRIDGE = {
  bridge: 'br0',
  description: 'bridge nad',
  macSpoof: true,
  name: 'network-bridge',
  type: 'Bridge',
};
const NAD_OVN = { description: 'ovn nad', name: 'network-ovn', type: 'OVN' };
const NAD_LOCALNET = {
  bridge: 'br0',
  description: 'localnet nad',
  mtu: '1500',
  name: 'network-localnet',
  type: 'Localnet',
};

/** Build a minimal valid NetworkAttachmentDefinition YAML for the given config. */
function buildNADYaml(nad: typeof NAD_BRIDGE | typeof NAD_LOCALNET | typeof NAD_OVN): string {
  let cniConfig: Record<string, unknown> = { cniVersion: '0.3.1', name: nad.name };

  if (nad.type === 'Bridge') {
    const b = nad as typeof NAD_BRIDGE;
    cniConfig = { ...cniConfig, bridge: b.bridge, macspoofchk: b.macSpoof, type: 'bridge' };
  } else if (nad.type === 'OVN') {
    cniConfig = { ...cniConfig, topology: 'layer2', type: 'ovn-k8s-cni-overlay' };
  } else if (nad.type === 'Localnet') {
    const l = nad as typeof NAD_LOCALNET;
    cniConfig = {
      ...cniConfig,
      mtu: parseInt(l.mtu),
      physicalNetworkName: l.bridge,
      topology: 'localnet',
      type: 'ovn-k8s-cni-overlay',
    };
  }

  return [
    `apiVersion: k8s.cni.cncf.io/v1`,
    `kind: NetworkAttachmentDefinition`,
    `metadata:`,
    `  name: ${nad.name}`,
    `  namespace: ${NS}`,
    `  annotations:`,
    `    description: ${nad.description}`,
    `spec:`,
    `  config: '${JSON.stringify(cniConfig)}'`,
  ].join('\n');
}

/**
 * Fill the Monaco YAML editor with the given content.
 * Prefers the Monaco model API (instant); falls back to keyboard select-all + type.
 */
async function fillYamlEditor(page: Page, yaml: string) {
  const filled = await page.evaluate((content) => {
    const model = (window as any).monaco?.editor?.getModels?.()[0];
    if (model) {
      model.setValue(content);
      return true;
    }
    return false;
  }, yaml);

  if (!filled) {
    const editor = page.locator('[role="textbox"][aria-multiline="true"]');
    await expect(editor).toBeVisible({ timeout: 10 * SECOND });
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type(yaml, { delay: 0 });
  }
}

async function createNAD(
  page: Page,
  nad: typeof NAD_BRIDGE | typeof NAD_LOCALNET | typeof NAD_OVN,
) {
  const createUrl = `/k8s/ns/${NS}/k8s.cni.cncf.io~v1~NetworkAttachmentDefinition/~new`;
  const editor = page.locator('[role="textbox"][aria-multiline="true"]');
  const notFound = page.getByRole('heading', { name: 'Page Not Found' });

  // Navigate to the create form; retry if the console shows a 404
  // (the console bridge can briefly lose CRD context between rapid navigations)
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(createUrl);
    await Promise.race([
      editor.waitFor({ state: 'visible', timeout: 15 * SECOND }),
      notFound.waitFor({ state: 'visible', timeout: 15 * SECOND }),
    ]).catch(() => undefined);

    if (await editor.isVisible()) break;

    await page.waitForTimeout(3 * SECOND);
  }

  await expect(editor).toBeVisible({ timeout: 15 * SECOND });

  await fillYamlEditor(page, buildNADYaml(nad));

  await byTest(page, SAVE_CHANGES).click();

  // Wait for navigation to the detail page after successful creation
  await page.waitForURL(
    `**/k8s/ns/${NS}/k8s.cni.cncf.io~v1~NetworkAttachmentDefinition/${nad.name}`,
    { timeout: 30 * SECOND },
  );
}

async function deleteNAD(page: Page, nadName: string) {
  const row = page.getByRole('row').filter({ hasText: nadName });
  await expect(row).toBeVisible({ timeout: 10 * SECOND });
  await row.locator(`[data-test-id="${KEBAB_BUTTON}"]`).click();
  await page.getByRole('menuitem', { name: 'Delete NetworkAttachmentDefinition' }).click();
  await byTest(page, CONFIRM_ACTION).click();
  await expect(byTestId(page, nadName)).toHaveCount(0);
}

test.describe('Network Attachment Definitions', () => {
  test.beforeAll(() => {
    deleteResource('net-attach-def', NAD_BRIDGE.name, NS);
    deleteResource('net-attach-def', NAD_LOCALNET.name, NS);
    deleteResource('net-attach-def', NAD_OVN.name, NS);
  });

  test.beforeEach(async ({ page }) => {
    const listHeading = page.getByRole('heading', { name: 'NetworkAttachmentDefinitions' });
    const notFound = page.getByRole('heading', { name: 'Page Not Found' });

    for (let attempt = 0; attempt < 3; attempt++) {
      await goto.networking(page, NS);
      await Promise.race([
        listHeading.waitFor({ state: 'visible', timeout: 15 * SECOND }),
        notFound.waitFor({ state: 'visible', timeout: 15 * SECOND }),
      ]).catch(() => undefined);

      if (await listHeading.isVisible()) break;
      await page.waitForTimeout(3 * SECOND);
    }
  });

  test('create NAD with MAC Spoof checked', async ({ page }) => {
    await createNAD(page, NAD_BRIDGE);
  });

  test('create NAD with OVN Kubernetes localnet network', async ({ page }) => {
    await createNAD(page, NAD_LOCALNET);
  });

  test('create NAD with OVN overlay network', async ({ page }) => {
    await createNAD(page, NAD_OVN);
  });

  test('delete NADs', async ({ page }) => {
    await deleteNAD(page, NAD_BRIDGE.name);
    await deleteNAD(page, NAD_LOCALNET.name);
    await deleteNAD(page, NAD_OVN.name);
  });
});
