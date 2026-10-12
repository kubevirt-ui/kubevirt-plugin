import * as k8s from '@kubernetes/client-node';

import { ensureNamespace } from './reconciler-helpers';
import type { ControllerConfig } from './types';

/** Provision a test namespace with required RBAC for the runner SA. */
export const provisionNamespace = async (
  kubeConfig: k8s.KubeConfig,
  config: ControllerConfig,
  testNs: string,
): Promise<void> => {
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const rbacApi = kubeConfig.makeApiClient(k8s.RbacAuthorizationV1Api);

  await ensureNamespace(coreApi, testNs, {
    'ci.kubevirt-plugin/managed': 'true',
  });

  const roleBindingName = `ci-runner-${testNs}`;
  try {
    await rbacApi.createNamespacedRoleBinding({
      body: {
        metadata: { name: roleBindingName, namespace: testNs },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'admin',
        },
        subjects: [
          {
            kind: 'ServiceAccount',
            name: config.runnerSaName,
            namespace: config.runnerSaNs,
          },
        ],
      },
      namespace: testNs,
    });
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 409) {
      throw err;
    }
  }
};
