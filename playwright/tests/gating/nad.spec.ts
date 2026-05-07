/**
 * Network Attachment Definitions.
 * Mirrors: cypress/tests/gating/nad.cy.ts
 */
import { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';
import { byTest, byTestId } from '../../utils/locators';
import { goto } from '../../utils/nav';

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
    await expect(editor).toBeVisible({ timeout: 10_000 });
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type(yaml, { delay: 0 });
  }
}

async function createNAD(
  page: Page,
  nad: typeof NAD_BRIDGE | typeof NAD_LOCALNET | typeof NAD_OVN,
) {
  // Navigate directly to the namespace-scoped create form
  await page.goto(`/k8s/ns/${NS}/k8s.cni.cncf.io~v1~NetworkAttachmentDefinition/~new`);
  await page.waitForLoadState('domcontentloaded');

  // Wait for the editor to be ready before filling
  await expect(page.locator('[role="textbox"][aria-multiline="true"]')).toBeVisible({
    timeout: 15_000,
  });

  await fillYamlEditor(page, buildNADYaml(nad));

  await byTest(page, 'save-changes').click();
}

async function deleteNAD(page: Page, nadName: string) {
  const row = page.getByRole('row').filter({ hasText: nadName });
  // Row kebab button uses data-test-id="kebab-button" (standard console pattern)
  await row.locator('[data-test-id="kebab-button"]').click();
  // Menu item role is "menuitem"; text matches the full console label
  await page.getByRole('menuitem', { name: 'Delete NetworkAttachmentDefinition' }).click();
  await page.locator('[data-test="confirm-action"]').click();
  await expect(byTestId(page, nadName)).toHaveCount(0);
}

test.describe.skip('Network Attachment Definitions', () => {
  test.beforeEach(async ({ page }) => {
    await goto.networking(page, NS);
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
