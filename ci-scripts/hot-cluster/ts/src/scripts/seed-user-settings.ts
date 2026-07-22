/**
 * Seed kubevirt-user-settings and kubevirt-ui-features ConfigMaps.
 * Replaces the complex bash block that uses oc + jq for ConfigMap patching.
 *
 * Env: CI_ENV_CM, TEST_NS, CNV_NS, TEST_ENGINE
 */

import { KubeClient, requireEnv } from '../kube-client';

const USER_SETTINGS = JSON.stringify({
  quickStart: { dontShowWelcomeModal: true },
  onboardingPopoversHidden: { vmsTab: true, catalog: true, createProject: true, navCollapse: true },
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
  let saUid = '';
  try {
    const sa = await coreApi.readNamespacedServiceAccount({ name: saName, namespace: testNs });
    saUid = sa.metadata?.uid ?? '';
  } catch { /* SA may not exist yet */ }

  const sanitizedName = `system-serviceaccount-${testNs}-${saName}`;

  // Ensure kubevirt-user-settings ConfigMap exists
  try {
    await coreApi.readNamespacedConfigMap({ name: 'kubevirt-user-settings', namespace: cnvNs });
  } catch {
    await coreApi.createNamespacedConfigMap({
      namespace: cnvNs,
      body: { metadata: { name: 'kubevirt-user-settings', namespace: cnvNs } },
    });
  }

  // Patch user settings
  const patchData: Record<string, string> = { [sanitizedName]: USER_SETTINGS };
  if (saUid) patchData[saUid] = USER_SETTINGS;

  await coreApi.patchNamespacedConfigMap({
    name: 'kubevirt-user-settings',
    namespace: cnvNs,
    body: { data: patchData },
  });

  // Patch kubevirt-ui-features
  await coreApi.patchNamespacedConfigMap({
    name: 'kubevirt-ui-features',
    namespace: cnvNs,
    body: { data: { advancedSearch: 'true', treeViewFolders: 'true' } },
  });

  // Cypress-only: seed guided tour completion
  if (testEngine === 'cypress' && saUid) {
    const cmName = `user-settings-${saUid}`;
    const cmNs = 'openshift-console-user-settings';

    try {
      await coreApi.readNamespacedConfigMap({ name: cmName, namespace: cmNs });
    } catch {
      await coreApi.createNamespacedConfigMap({
        namespace: cmNs,
        body: { metadata: { name: cmName, namespace: cmNs } },
      });
    }

    await coreApi.patchNamespacedConfigMap({
      name: cmName,
      namespace: cmNs,
      body: { data: { 'console.guidedTour': GUIDED_TOUR } },
    });
  }

  console.log('User settings seeded successfully.');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
