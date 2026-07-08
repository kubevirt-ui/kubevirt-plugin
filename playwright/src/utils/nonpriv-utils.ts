import type { KubernetesClient } from '@/clients/kubernetes-client';

import { logger } from './logger';

export const NONPRIV_IDP_NAME = 'test-users';

/**
 * Wait for OAuth server pods to roll out after IDP changes.
 */
export async function waitForOAuthRollout(
  k8sClient: KubernetesClient,
  timeoutMs = 120_000,
): Promise<void> {
  logger.info('Waiting for OAuth server rollout...');
  const start = Date.now();
  const coreApi = k8sClient.getCoreV1Api();

  while (Date.now() - start < timeoutMs) {
    try {
      const pods = await coreApi.listNamespacedPod({
        namespace: 'openshift-authentication',
        labelSelector: 'app=oauth-openshift',
      });

      const allReady = pods.items.every((pod) =>
        pod.status?.conditions?.some((c) => c.type === 'Ready' && c.status === 'True'),
      );

      if (allReady && pods.items.length > 0) {
        logger.success('✓ OAuth server pods are ready');
        return;
      }
    } catch {
      // Pods may not exist yet during rollout
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  logger.warn('⚠️ OAuth rollout wait timed out — proceeding anyway');
}

/**
 * Remove the non-priv test user and all associated RBAC resources.
 */
export async function removeNonPrivUser(
  k8sClient: KubernetesClient,
  username: string,
  testNamespace: string,
  cnvNamespace: string,
): Promise<void> {
  logger.info(`Removing non-priv user "${username}" resources...`);

  const rbacApi = k8sClient.getRbacApi();
  const coreApi = k8sClient.getCoreV1Api();

  const bindingNames = [
    `${username}-kubevirt-${testNamespace}`,
    `${username}-view-${cnvNamespace}`,
  ];

  for (const bindingName of bindingNames) {
    try {
      await rbacApi.deleteNamespacedRoleBinding({ name: bindingName, namespace: testNamespace });
      logger.info(`✓ Deleted RoleBinding: ${bindingName}`);
    } catch {
      // May not exist
    }
  }

  const clusterBindings = [`${username}-cluster-view`, `${username}-cdi-cluster-read`];
  for (const name of clusterBindings) {
    try {
      await rbacApi.deleteClusterRoleBinding({ name });
      logger.info(`✓ Deleted ClusterRoleBinding: ${name}`);
    } catch {
      // May not exist
    }
  }

  try {
    const secret = await coreApi.readNamespacedSecret({
      name: 'htpass-secret',
      namespace: 'openshift-config',
    });
    if (secret?.data?.htpasswd) {
      const current = Buffer.from(secret.data.htpasswd, 'base64').toString('utf-8');
      const lines = current.split('\n').filter((line) => !line.startsWith(`${username}:`));
      const updated = Buffer.from(lines.join('\n')).toString('base64');
      await coreApi.patchNamespacedSecret({
        name: 'htpass-secret',
        namespace: 'openshift-config',
        body: { data: { htpasswd: updated } },
      });
      logger.info(`✓ Removed ${username} from htpasswd secret`);
    }
  } catch {
    logger.warn(`⚠️ Could not remove ${username} from htpasswd secret`);
  }
}
