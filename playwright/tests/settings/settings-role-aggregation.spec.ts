import type RequestContextClient from '@/clients/request-context-client';
import { CNV_SETTINGS_TAG, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';
import type SettingsPage from '@/page-objects/settings/settings-page';
import { EnvVariables } from '@/utils/env-variables';
import { TestTimeouts } from '@/utils/test-config';

const HCO_NAME = 'kubevirt-hyperconverged';
const STRATEGY_AGGREGATE_TO_DEFAULT = 'AggregateToDefault';
const STRATEGY_MANUAL = 'Manual';
const AGGREGATE_LABELS: Record<string, string> = {
  'kubevirt.io:admin': 'rbac.authorization.k8s.io/aggregate-to-admin',
  'kubevirt.io:edit': 'rbac.authorization.k8s.io/aggregate-to-edit',
  'kubevirt.io:view': 'rbac.authorization.k8s.io/aggregate-to-view',
};

async function getHcoStrategyField(apiClient: RequestContextClient): Promise<string | undefined> {
  const hco = await apiClient.getHyperConverged(EnvVariables.cnvNamespace, HCO_NAME);
  return (hco?.spec as Record<string, unknown> | undefined)?.roleAggregationStrategy as
    | string
    | undefined;
}

async function hasAggregateLabels(apiClient: RequestContextClient): Promise<boolean> {
  const results = await Promise.all(
    Object.entries(AGGREGATE_LABELS).map(async ([roleName, labelKey]) => {
      const role = await apiClient.getResource(
        'rbac.authorization.k8s.io',
        'v1',
        'clusterroles',
        roleName,
      );
      return role?.metadata?.labels?.[labelKey] === 'true';
    }),
  );
  return results.every(Boolean);
}

test.describe('Role aggregation strategy', { tag: [GATING_TAG, CNV_SETTINGS_TAG] }, () => {
  let originalStrategy: string | undefined;

  test.beforeAll(async ({ apiClient }) => {
    originalStrategy = await getHcoStrategyField(apiClient);
  });

  test.afterAll(async ({ apiClient }) => {
    const restore = originalStrategy || STRATEGY_AGGREGATE_TO_DEFAULT;
    try {
      await patchHcoStrategy(apiClient, restore);
    } catch {
      // best-effort restore
    }
  });

  test('preview ON enables grant toggle; grant ON/OFF updates strategy and VM access', async ({
    settingsPage,
    apiClient,
  }) => {
    await settingsPage.navigateToSettings();
    await assertPreviewControlsGrantToggle(settingsPage, true);
    await setGrantAndAssertAggregation(settingsPage, apiClient, {
      enable: true,
      expectedStrategy: STRATEGY_AGGREGATE_TO_DEFAULT,
      expectAggregateLabel: true,
    });
    await setGrantAndAssertAggregation(settingsPage, apiClient, {
      enable: false,
      expectedStrategy: STRATEGY_MANUAL,
      expectAggregateLabel: false,
    });
    await assertPreviewControlsGrantToggle(settingsPage, false);
  });
});

async function assertPreviewControlsGrantToggle(
  settingsPage: SettingsPage,
  enablePreview: boolean,
): Promise<void> {
  const onOffOption = enablePreview ? 'ON' : 'OFF';

  await settingsPage.navigateToPreviewFeatures();
  const previewSet = enablePreview
    ? await settingsPage.enableControlDefaultVirtualizationPermissions()
    : await settingsPage.disableControlDefaultVirtualizationPermissions();
  expect(previewSet, `controlDefaultVirtualizationPermissions should be ${onOffOption}`).toBe(true);

  await settingsPage.navigateToSettings();

  const onCluster = await settingsPage.navigateToClusterTab();
  expect(onCluster, 'Cluster tab should open').toBe(true);

  const sectionOpen = await settingsPage.openAutomaticGrantVirtualizationRolesSection();
  expect(sectionOpen, 'Automatically grant Virtualization roles section should open').toBe(true);

  await expect
    .poll(async () => settingsPage.isAutomaticGrantVirtualizationRolesEnabled(), {
      intervals: [1_000],
      timeout: TestTimeouts.DEFAULT,
    })
    .toBe(enablePreview);
}

async function assertHcoStrategy(apiClient: RequestContextClient, expectedStrategy: string) {
  await expect
    .poll(
      async () => {
        const strategy = await getHcoStrategyField(apiClient);
        return strategy ?? STRATEGY_AGGREGATE_TO_DEFAULT;
      },
      { intervals: [2_000], timeout: TestTimeouts.DEFAULT },
    )
    .toBe(expectedStrategy);
}

async function assertAggregateLabels(apiClient: RequestContextClient, expectPresent: boolean) {
  await expect
    .poll(
      async () => {
        const allPresent = await hasAggregateLabels(apiClient);
        return allPresent;
      },
      { intervals: [2_000], timeout: TestTimeouts.DEFAULT },
    )
    .toBe(expectPresent);
}

async function setGrantAndAssertAggregation(
  settingsPage: SettingsPage,
  apiClient: RequestContextClient,
  options: {
    enable: boolean;
    expectedStrategy: string;
    expectAggregateLabel: boolean;
  },
): Promise<void> {
  const { enable, expectedStrategy, expectAggregateLabel } = options;
  const onOffOption = enable ? 'ON' : 'OFF';

  const toggled = await settingsPage.setAutomaticGrantVirtualizationRoles(enable);
  expect(toggled, `AutomaticallyGrantVirtualizationRoles should be ${onOffOption}`).toBe(true);

  await expect
    .poll(async () => settingsPage.isAutomaticGrantVirtualizationRolesChecked(), {
      intervals: [500],
      timeout: TestTimeouts.DEFAULT,
    })
    .toBe(enable);

  await assertHcoStrategy(apiClient, expectedStrategy);
  await assertAggregateLabels(apiClient, expectAggregateLabel);
}

async function patchHcoStrategy(apiClient: RequestContextClient, strategy: string): Promise<void> {
  const current = await getHcoStrategyField(apiClient);
  const op = current ? 'replace' : 'add';
  await apiClient.patchHyperConverged(EnvVariables.cnvNamespace, HCO_NAME, [
    { op, path: '/spec/roleAggregationStrategy', value: strategy },
  ]);
}
