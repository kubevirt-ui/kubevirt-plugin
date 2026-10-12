import * as k8s from '@kubernetes/client-node';

import { deleteNamespace, waitForNamespaceDeletion } from './reconciler-helpers';
import type { ControllerConfig } from './types';

/** Clean up CI test environment resources. */
export const cleanupResources = async (
  kubeConfig: k8s.KubeConfig,
  _config: ControllerConfig,
  testNs: string,
  helmRelease: string,
  _authMode: string,
  _htpasswdUser: string,
): Promise<void> => {
  const coreApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  const rbacApi = kubeConfig.makeApiClient(k8s.RbacAuthorizationV1Api);

  const clusterRoleBindingName = `${helmRelease}-console-admin`;
  try {
    await rbacApi.deleteClusterRoleBinding({ name: clusterRoleBindingName });
    console.log(`Deleted ClusterRoleBinding ${clusterRoleBindingName}`);
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 404) {
      console.warn(`Could not delete CRB ${clusterRoleBindingName}: ${(err as Error).message}`);
    }
  }

  await deleteNamespace(coreApi, testNs);
  await waitForNamespaceDeletion(coreApi, testNs);
  console.log(`Namespace ${testNs} cleaned up.`);
};
