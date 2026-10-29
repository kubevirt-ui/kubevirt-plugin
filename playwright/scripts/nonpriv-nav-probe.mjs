import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base =
  process.env.WEB_CONSOLE_URL ||
  'https://console-openshift-console.apps.uit-416-7623.rhos-psi.cnv-qe.rhood.us';
const statePath =
  process.env.STORAGE_STATE ||
  `${process.cwd()}/.storage-states/nonpriv-state.json`;

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-certificate-errors', '--no-sandbox'],
});
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const context = await browser.newContext({
  baseURL: base,
  ignoreHTTPSErrors: true,
  storageState: statePath,
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') pageErrors.push(msg.text());
});

async function snap(label) {
  const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
  return {
    label,
    url: page.url(),
    toggle: ((await toggle.textContent().catch(() => '')) || '').trim(),
    title: await page.title(),
  };
}

await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForTimeout(3000);
const home = await snap('home');

await page.goto(`${base}/k8s/cluster/projects`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForTimeout(3000);
const projects = await snap('cluster/projects');

const testNs = process.env.PROBE_NS || 'openshift';
await page.goto(`${base}/k8s/ns/${testNs}/catalog/instanceTypes`, {
  waitUntil: 'domcontentloaded',
  timeout: 120_000,
});
const osImagesNs = 'openshift-virtualization-os-images';
const panel = page.getByRole('tabpanel', { name: /InstanceTypes/i });
await panel.waitFor({ state: 'visible', timeout: 120_000 });
const volToggle = panel.locator('.bootable-volume-list-bar .project-dropdown button').first();
let volumesProject = { opened: false, selected: false, fedoraRow: false, rowCount: 0 };
if (await volToggle.isVisible().catch(() => false)) {
  await volToggle.click();
  volumesProject.opened = true;
  const search = page.getByRole('searchbox', { name: /Search input/i });
  if (await search.isVisible().catch(() => false)) {
    await search.fill(osImagesNs);
  }
  const opt = page
    .locator(`[data-test-id="select-option-${osImagesNs}"]`)
    .or(page.getByRole('option', { name: new RegExp(osImagesNs, 'i') }));
  await opt.first().click();
  volumesProject.selected = true;
  await page.waitForTimeout(8000);
  volumesProject.rowCount = await panel.locator('table.BootableVolumeList-table tbody tr, table tbody tr').count();
  volumesProject.fedoraRow = await panel
    .locator('table tbody tr')
    .filter({ hasText: /fedora/i })
    .first()
    .isVisible()
    .catch(() => false);
}

let loader = await page.locator('.create-vm-instance-type-section__page-loader').isVisible().catch(() => false);
for (let i = 0; i < 12 && loader; i += 1) {
  await page.waitForTimeout(5000);
  loader = await page.locator('.create-vm-instance-type-section__page-loader').isVisible().catch(() => false);
}
const instanceTypes = {
  ...(await snap('catalog/instanceTypes')),
  volumesProject,
  hasItTab: await page.getByRole('tab', { name: /InstanceTypes/i }).isVisible().catch(() => false),
  panelVisible: await panel.isVisible().catch(() => false),
  tableInPanel: await panel.locator('table').first().isVisible().catch(() => false),
  selectVolume: await page.getByText(/Select volume to boot from/i).isVisible().catch(() => false),
  loader: await page.locator('.create-vm-instance-type-section__page-loader').isVisible().catch(() => false),
  bodyHead: (await page.locator('main').innerText().catch(() => '')).slice(0, 800),
};

await page.goto(`${base}/k8s/ns/${testNs}/catalog/template`, {
  waitUntil: 'domcontentloaded',
  timeout: 120_000,
});
await page.waitForTimeout(5000);
await page.locator('#vm-catalog-grid, .vm-catalog-grid, .vm-catalog-grid-tile').first().waitFor({ state: 'visible', timeout: 120_000 }).catch(() => undefined);
const tile = page.locator('[data-test="rhel9-server-small"]').or(page.getByText(/rhel9-server-small/i)).first();
if (await tile.isVisible().catch(() => false)) {
  await tile.click();
  await page.waitForTimeout(8000);
}
const drawer = page.getByRole('dialog', { name: /Template drawer/i });
const catalog = {
  ...(await snap('catalog/template+rhel9')),
  drawerVisible: await drawer.isVisible().catch(() => false),
  customizeInDrawer: await drawer.getByTestId('customize-vm-btn').isVisible().catch(() => false),
  customizePage: await page
    .getByRole('button', { name: /^Customize VirtualMachine$/i })
    .first()
    .isVisible()
    .catch(() => false),
  quickCreateHeading: await page
    .getByRole('heading', { name: /^Quick create VirtualMachine$/i })
    .isVisible()
    .catch(() => false),
};

// Try perspective menu switch from Developer
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForTimeout(2000);
const toggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
let menuSwitch = null;
if (await toggle.isVisible().catch(() => false)) {
  const before = ((await toggle.textContent()) || '').trim();
  if (!/administrator/i.test(before)) {
    await toggle.click({ force: true });
    const adminOpt = page
      .locator('[data-test-id="perspective-switcher-menu-option"]')
      .filter({ hasText: /Administrator/i });
    const devOpt = page
      .locator('[data-test-id="perspective-switcher-menu-option"]')
      .filter({ hasText: /Developer/i });
    menuSwitch = {
      before,
      adminVisible: await adminOpt.isVisible().catch(() => false),
      devVisible: await devOpt.isVisible().catch(() => false),
      options: await page
        .locator('[data-test-id="perspective-switcher-menu-option"]')
        .allTextContents()
        .catch(() => []),
    };
    if (await adminOpt.isVisible().catch(() => false)) {
      await adminOpt.click();
      await page.waitForTimeout(3000);
      menuSwitch.after = ((await toggle.textContent()) || '').trim();
      menuSwitch.url = page.url();
    }
  }
}

console.log(JSON.stringify({ home, projects, instanceTypes, catalog, menuSwitch, pageErrors: pageErrors.slice(0, 20) }, null, 2));
await browser.close();
