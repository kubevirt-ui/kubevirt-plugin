/**
 * Seed kubevirt-user-settings and kubevirt-ui-features ConfigMaps.
 * Replaces the complex bash block that uses oc + jq for ConfigMap patching.
 *
 * Env: CI_ENV_CM, TEST_NS, CNV_NS, TEST_ENGINE
 */

import * as k8s from '@kubernetes/client-node';

import { KubeClient, requireEnv } from '../kube-client';

const mergeConfigMapData = async (
  api: k8s.CoreV1Api,
  name: string,
  namespace: string,
  data: Record<string, string>,
): Promise<void> => {
  const cm = await api.readNamespacedConfigMap({ name, namespace });
  const merged = { ...cm.data, ...data };
  await api.replaceNamespacedConfigMap({
    body: { ...cm, data: merged },
    name,
    namespace,
  });
};

const USER_SETTINGS = JSON.stringify({
  onboardingPopoversHidden: { catalog: true, createProject: true, navCollapse: true, vmsTab: true },
  quickStart: { dontShowWelcomeModal: true },
});

const GUIDED_TOUR = JSON.stringify({
  admin: { completed: true },
  dev: { completed: true },
  'virtualization-perspective': { completed: true },
});

const main = async (): Promise<void> => {
  const ciEnvCm = requireEnv('CI_ENV_CM');
  const testNs = requireEnv('TEST_NS');
  const cnvNs = requireEnv('CNV_NS');
  const testEngine = process.env.TEST_ENGINE ?? 'playwright';

  const client = KubeClient.fromKubeconfig();
  const coreApi = client.coreV1;

  const saName = `${ciEnvCm}-console`;

  // Get SA UID
  const saUid = await (async (): Promise<string> => {
    try {
      const serviceAccount = await coreApi.readNamespacedServiceAccount({
        name: saName,
        namespace: testNs,
      });
      return serviceAccount.metadata?.uid ?? '';
    } catch {
      return '';
    }
  })();

  const sanitizedName = `system-serviceaccount-${testNs}-${saName}`;

  // Ensure kubevirt-user-settings ConfigMap exists
  try {
    await coreApi.readNamespacedConfigMap({ name: 'kubevirt-user-settings', namespace: cnvNs });
  } catch {
    await coreApi.createNamespacedConfigMap({
      body: { metadata: { name: 'kubevirt-user-settings', namespace: cnvNs } },
      namespace: cnvNs,
    });
  }

  // Merge user settings into ConfigMap via read + replace
  const patchData: Record<string, string> = { [sanitizedName]: USER_SETTINGS };
  if (saUid) {
    patchData[saUid] = USER_SETTINGS;
  }

  await mergeConfigMapData(coreApi, 'kubevirt-user-settings', cnvNs, patchData);

  // Ensure kubevirt-ui-features ConfigMap exists
  try {
    await coreApi.readNamespacedConfigMap({ name: 'kubevirt-ui-features', namespace: cnvNs });
  } catch {
    await coreApi.createNamespacedConfigMap({
      body: { metadata: { name: 'kubevirt-ui-features', namespace: cnvNs } },
      namespace: cnvNs,
    });
  }

  await mergeConfigMapData(coreApi, 'kubevirt-ui-features', cnvNs, {
    advancedSearch: 'true',
    treeViewFolders: 'true',
  });

  // Cypress-only: seed guided tour completion
  if (testEngine === 'cypress' && saUid) {
    const cmName = `user-settings-${saUid}`;
    const cmNs = 'openshift-console-user-settings';

    try {
      await coreApi.readNamespacedConfigMap({ name: cmName, namespace: cmNs });
    } catch {
      await coreApi.createNamespacedConfigMap({
        body: { metadata: { name: cmName, namespace: cmNs } },
        namespace: cmNs,
      });
    }

    await mergeConfigMapData(coreApi, cmName, cmNs, { 'console.guidedTour': GUIDED_TOUR });
  }

  console.log('User settings seeded successfully.');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
