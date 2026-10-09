import type RequestContextClient from '@/clients/request-context-client';
import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { K8S_RESOURCE_NAMES } from '@/data-models/constants';
import type { JsonPatchOp } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/settings-fixture';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';

const SUITE = 'Passt binding preview feature';
const PASST_ANNOTATION = 'hco.kubevirt.io/deployPasstNetworkBinding';
const PASST_ANNOTATION_PATH = '/metadata/annotations/hco.kubevirt.io~1deployPasstNetworkBinding';

async function getPasstAnnotation(
  apiClient: RequestContextClient,
  namespace: string,
): Promise<string | undefined> {
  const hyperConverged = await apiClient.getHyperConverged(
    namespace,
    K8S_RESOURCE_NAMES.KUBEVIRT_HYPERCONVERGED,
  );
  return hyperConverged?.metadata?.annotations?.[PASST_ANNOTATION];
}

async function expectPasstAnnotation(
  apiClient: RequestContextClient,
  namespace: string,
  expected: string,
): Promise<void> {
  await expect
    .poll(async () => getPasstAnnotation(apiClient, namespace), {
      message: `HyperConverged ${PASST_ANNOTATION} should be ${expected}`,
      timeout: 20_000,
      intervals: [1_000, 2_000, 3_000],
    })
    .toBe(expected);
}

async function restorePasstAnnotation(
  apiClient: RequestContextClient,
  namespace: string,
  original: string | undefined,
): Promise<void> {
  const patch: JsonPatchOp[] =
    original === undefined
      ? [{ op: 'remove', path: PASST_ANNOTATION_PATH }]
      : [{ op: 'replace', path: PASST_ANNOTATION_PATH, value: original }];

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

test.describe('Passt binding preview feature', { tag: [ROUTE_VIRTUALIZATION_SETTINGS_TAG, CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  let originalAnnotation: string | undefined;

  test.beforeAll(async ({ apiClient, utils }) => {
    originalAnnotation = await getPasstAnnotation(apiClient, utils.EnvVariables.cnvNamespace);
  });

  test.afterAll(async ({ apiClient, utils }) => {
    await restorePasstAnnotation(apiClient, utils.EnvVariables.cnvNamespace, originalAnnotation);
  });

  test('Passt binding toggle updates the HyperConverged deployPasstNetworkBinding annotation', async ({
    apiClient,
    settingsPage,
    utils,
  }) => {
    utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });
    const namespace = utils.EnvVariables.cnvNamespace;

    await test.step('Open Settings → Preview features', async () => {
      await settingsPage.navigateToSettingsViaSidebar();
      const loaded = await settingsPage.navigateToPreviewFeatures();
      expect(loaded, 'Preview features tab should load').toBe(true);
    });

    await test.step('Turn Passt binding on and verify the annotation', async () => {
      const enabled = await settingsPage.setPasstBindingEnabled(true);
      expect(enabled, 'Passt binding switch should be on').toBe(true);
      expect(await settingsPage.isPasstBindingOn(), 'Passt binding switch should stay on').toBe(
        true,
      );
      await expectPasstAnnotation(apiClient, namespace, 'true');
    });

    await test.step('Turn Passt binding off and verify the annotation', async () => {
      const disabled = await settingsPage.setPasstBindingEnabled(false);
      expect(disabled, 'Passt binding switch should be off').toBe(true);
      expect(await settingsPage.isPasstBindingOn(), 'Passt binding switch should stay off').toBe(
        false,
      );
      await expectPasstAnnotation(apiClient, namespace, 'false');
    });
  });
});
