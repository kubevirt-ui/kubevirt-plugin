import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import {
  CONFIGMAP_NAME,
  CONFIGMAP_NAMESPACE,
  generateWithNumbers,
  KUBEVIRT_VM_LATENCY_LABEL,
} from '../../utils/utils';
import {
  KUBEVIRT_STORAGE_LABEL_VALUE,
  STORAGE_CHECKUP_PARAM_NUM_OF_VMS,
  STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN,
  STORAGE_CHECKUP_PARAM_STORAGE_CLASS,
  STORAGE_CHECKUP_PARAM_VMI_TIMEOUT,
  STORAGE_CHECKUP_ROLE,
  STORAGE_CHECKUP_SA,
  STORAGE_CHECKUP_TIMEOUT,
  STORAGE_CLUSTER_ROLE_BINDING,
} from './consts';

export type SkipTeardownOption = 'always' | 'never' | 'onfailure';

export type StorageCheckupParams = {
  name: string;
  namespace: string;
  numOfVMs?: string;
  skipTeardown?: SkipTeardownOption;
  storageClass?: string;
  timeOut: string;
  vmiTimeout?: string;
};

export const storageClusterRoleBinding = (namespace: string): Record<string, unknown> => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'ClusterRoleBinding',
  metadata: { name: STORAGE_CLUSTER_ROLE_BINDING },
  roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'cluster-reader' },
  subjects: [{ kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }],
});

export const serviceAccountResource = (namespace: string): Record<string, unknown> => ({
  metadata: { name: STORAGE_CHECKUP_SA, namespace },
});

export const storageCheckupRole = (namespace: string): Record<string, unknown> => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'Role',
  metadata: { name: STORAGE_CHECKUP_ROLE, namespace },
  rules: [
    { apiGroups: [''], resources: ['configmaps'], verbs: ['get', 'update'] },
    { apiGroups: ['kubevirt.io'], resources: ['virtualmachines'], verbs: ['create', 'delete'] },
    { apiGroups: ['kubevirt.io'], resources: ['virtualmachineinstances'], verbs: ['get'] },
    {
      apiGroups: ['subresources.kubevirt.io'],
      resources: ['virtualmachineinstances/addvolume', 'virtualmachineinstances/removevolume'],
      verbs: ['update'],
    },
    {
      apiGroups: ['kubevirt.io'],
      resources: ['virtualmachineinstancemigrations'],
      verbs: ['create'],
    },
    { apiGroups: ['cdi.kubevirt.io'], resources: ['datavolumes'], verbs: ['create', 'delete'] },
    { apiGroups: [''], resources: ['persistentvolumeclaims'], verbs: ['delete'] },
  ],
});

export const storageCheckupRoleBinding = (namespace: string): Record<string, unknown> => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'RoleBinding',
  metadata: { name: STORAGE_CHECKUP_ROLE, namespace },
  roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'Role', name: STORAGE_CHECKUP_ROLE },
  subjects: [{ kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }],
});

const normalizeMinutes = (raw: string): string | undefined => {
  const trimmed = raw.trim().replace(/m$/i, '');
  const num = Number(trimmed);
  return Number.isFinite(num) && num > 0 ? `${trimmed}m` : undefined;
};

export const storageCheckupConfigMap = (params: StorageCheckupParams): IoK8sApiCoreV1ConfigMap => {
  const { name, namespace, numOfVMs, skipTeardown, storageClass, timeOut, vmiTimeout } = params;
  const data: Record<string, string> = { [STORAGE_CHECKUP_TIMEOUT]: `${timeOut}m` };

  if (storageClass) {
    data[STORAGE_CHECKUP_PARAM_STORAGE_CLASS] = storageClass;
  }
  if (vmiTimeout) {
    const normalized = normalizeMinutes(vmiTimeout);
    if (normalized) {
      data[STORAGE_CHECKUP_PARAM_VMI_TIMEOUT] = normalized;
    }
  }
  if (numOfVMs && Number(numOfVMs) > 0) {
    data[STORAGE_CHECKUP_PARAM_NUM_OF_VMS] = numOfVMs;
  }
  if (skipTeardown && skipTeardown !== 'never') {
    data[STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN] = skipTeardown;
  }

  return {
    apiVersion: 'v1',
    data,
    kind: ConfigMapModel.kind,
    metadata: {
      labels: { [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE },
      name,
      namespace,
    },
  };
};

export const storageCheckupJob = (
  name: string,
  namespace: string,
  checkupImage: string,
): IoK8sApiBatchV1Job => ({
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    labels: { [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE },
    name: generateWithNumbers(name),
    namespace,
  },
  spec: {
    backoffLimit: 0,
    template: {
      spec: {
        containers: [
          {
            env: [
              { name: CONFIGMAP_NAMESPACE, value: namespace },
              { name: CONFIGMAP_NAME, value: name },
            ],
            image: checkupImage,
            imagePullPolicy: 'Always',
            name: generateWithNumbers(name),
          },
        ],
        restartPolicy: 'Never',
        serviceAccount: STORAGE_CHECKUP_SA,
      },
    },
  },
});
