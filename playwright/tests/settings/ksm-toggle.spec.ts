import type RequestContextClient from '@/clients/request-context-client';
import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { K8S_RESOURCE_NAMES } from '@/data-models/constants';
import type { JsonPatchOp } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/settings-fixture';

const SUITE = 'Kernel Samepage Merging (KSM)';

type KSMConfiguration = { nodeLabelSelector?: Record<string, never> };
type KSMConfigurationInHCO = { ksmConfiguration?: KSMConfiguration };

const KSM_ENABLED_CONFIGURATION = { nodeLabelSelector: {} };
const KSM_DISABLED_CONFIGURATION = {};

async function getKsmConfiguration(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<unknown> {
  const hco = await apiClient.getHyperConverged(
    namespace,
    K8S_RESOURCE_NAMES.KUBEVIRT_HYPERCONVERGED,
  );
  return (hco?.spec as KSMConfigurationInHCO | undefined)?.ksmConfiguration;
}

async function expectKSMInHCO(
  apiClient: RequestContextClient,
  namespace: string,
  expectedResult: KSMConfiguration,
) {
  await expect
    .poll(async () => getKsmConfiguration(apiClient, namespace), {
      message: 'HyperConverged spec.ksmConfiguration should match KSM disabled patch value',
      timeout: 20_000,
      intervals: [1_000, 2_000, 3_000],
    })
    .toEqual(expectedResult);
}

async function restoreKsmConfiguration(
  apiClient: RequestContextClient,
  namespace: string,
  original: unknown,
): Promise<void> {
  const patch: JsonPatchOp[] =
    original === undefined
      ? [{ op: 'remove', path: '/spec/ksmConfiguration' }]
      : [{ op: 'replace', path: '/spec/ksmConfiguration', value: original }];

  try {
    await apiClient.patchHyperConverged(
      namespace,
      K8S_RESOURCE_NAMES.KUBEVIRT_HYPERCONVERGED,
      patch,
    );
  } catch {
    // best-effort restore
  }
}

test.describe('Kernel Samepage Merging (KSM)', { tag: [CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  test.afterAll(async ({ apiClient, utils }) => {
    const namespace = utils.EnvVariables.cnvNamespace;
    const originalKsmConfiguration = await getKsmConfiguration(apiClient, namespace);
    await restoreKsmConfiguration(apiClient, namespace, originalKsmConfiguration);
  });

  test('KSM toggle in Resource management updates HyperConverged ksmConfiguration', async ({
    settingsPage,
    apiClient,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });
    await settingsPage.navigateToSettingsViaSidebar();

    const namespace = utils.EnvVariables.cnvNamespace;

    await test.step('Open Settings → Resource management', async () => {
      await settingsPage.navigateToResourceManagement();
      const ksmVisible = await settingsPage.isKsmControlVisible();
      expect(ksmVisible, 'KSM toggle should be visible in Resource management').toBe(true);
    });

    await test.step('Turn KSM on and verify HyperConverged spec', async () => {
      await settingsPage.enableKSM();
      const enabled = await settingsPage.verifyKSMEnabled();
      expect(enabled, 'KSM switch should be on').toBe(true);
      await expectKSMInHCO(apiClient, namespace, KSM_ENABLED_CONFIGURATION);
    });

    await test.step('Turn KSM off and verify HyperConverged spec', async () => {
      await settingsPage.disableKSM();
      const enabled = await settingsPage.verifyKSMEnabled();
      expect(enabled, 'KSM switch should be off').toBe(false);
      await expectKSMInHCO(apiClient, namespace, KSM_DISABLED_CONFIGURATION);
    });
  });
});
