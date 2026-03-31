import { TFunction } from 'react-i18next';

import {
  ClusterRoleBindingModel,
  ConfigMapModel,
  JobModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1ClusterRoleBinding,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { SimpleSelectOption } from '@patternfly/react-templates';

import {
  CONFIGMAP_NAME,
  CONFIGMAP_NAMESPACE,
  generateWithNumbers,
  KUBEVIRT_VM_LATENCY_LABEL,
  STATUS_COMPLETION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from '../../utils/utils';

import {
  KUBEVIRT_STORAGE_LABEL_VALUE,
  STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS,
  STORAGE_CHECKUP_LIVE_MIGRATION,
  STORAGE_CHECKUP_PARAM_NUM_OF_VMS,
  STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN,
  STORAGE_CHECKUP_PARAM_STORAGE_CLASS,
  STORAGE_CHECKUP_PARAM_VMI_TIMEOUT,
  STORAGE_CHECKUP_ROLE,
  STORAGE_CHECKUP_SA,
  STORAGE_CHECKUP_TIMEOUT,
  STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE,
  STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE,
  STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT,
  STORAGE_CHECKUPS_STORAGE_WITH_RWX,
  STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS,
  STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME,
  STORAGE_CHECKUPS_VM_VOLUME_CLONE,
  STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS,
  STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS,
  STORAGE_CLUSTER_ROLE_BINDING,
} from './consts';

export type SkipTeardownOption = 'always' | 'never' | 'onfailure';

export const getSkipTeardownLabel = (t: TFunction, value: SkipTeardownOption): string => {
  const labels: Record<SkipTeardownOption, string> = {
    always: t('Always'),
    never: t('Never'),
    onfailure: t('On failure'),
  };
  return labels[value] ?? value;
};

const SKIP_TEARDOWN_VALUES: SkipTeardownOption[] = ['never', 'onfailure', 'always'];

export const getSkipTeardownOptions = (t: TFunction): SimpleSelectOption[] =>
  SKIP_TEARDOWN_VALUES.map((value) => ({ content: getSkipTeardownLabel(t, value), value }));

export const NUM_OF_VMS_MIN = 1;
export const NUM_OF_VMS_MAX = 100;

export const isNumOfVMsInvalid = (value: string): boolean => {
  if (!value) return false;
  const num = Number(value);
  return !Number.isInteger(num) || num < NUM_OF_VMS_MIN || num > NUM_OF_VMS_MAX;
};

export const parseMinutesValue = (raw: string): number => Number(raw.trim().replace(/m$/i, ''));

const storageClusterRoleBinding = (namespace: string) => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'ClusterRoleBinding',
  metadata: { name: STORAGE_CLUSTER_ROLE_BINDING },
  roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name: 'cluster-reader' },
  subjects: [{ kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }],
});

const serviceAccountResource = (namespace: string) => ({
  metadata: { name: STORAGE_CHECKUP_SA, namespace },
});

const storageCheckupRole = (namespace: string) => ({
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

const storageCheckupRoleBinding = (namespace: string) => ({
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'RoleBinding',
  metadata: { name: STORAGE_CHECKUP_ROLE, namespace },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'Role',
    name: STORAGE_CHECKUP_ROLE,
  },
  subjects: [{ kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }],
});

export type StorageCheckupParams = {
  name: string;
  namespace: string;
  numOfVMs?: string;
  skipTeardown?: SkipTeardownOption;
  storageClass?: string;
  timeOut: string;
  vmiTimeout?: string;
};

const normalizeMinutes = (raw: string): string | undefined => {
  const trimmed = raw.trim().replace(/m$/i, '');
  const num = Number(trimmed);
  return Number.isFinite(num) && num > 0 ? `${trimmed}m` : undefined;
};

const storageCheckupConfigMap = (params: StorageCheckupParams): IoK8sApiCoreV1ConfigMap => {
  const { name, namespace, numOfVMs, skipTeardown, storageClass, timeOut, vmiTimeout } = params;
  const data: Record<string, string> = {
    [STORAGE_CHECKUP_TIMEOUT]: `${timeOut}m`,
  };

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
      labels: {
        [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
      },
      name,
      namespace,
    },
  };
};

const storageCheckupJob = (
  name: string,
  namespace: string,
  checkupImage: string,
): IoK8sApiBatchV1Job => {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      labels: {
        [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
      },
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
  };
};

export const createStorageCheckup = async (
  params: StorageCheckupParams & { checkupImage: string; cluster: string },
): Promise<IoK8sApiBatchV1Job> => {
  const { checkupImage, cluster, name, namespace } = params;

  await kubevirtK8sCreate({
    cluster,
    data: storageCheckupConfigMap(params),
    model: ConfigMapModel,
  });

  return kubevirtK8sCreate({
    cluster,
    data: storageCheckupJob(name, namespace, checkupImage),
    model: JobModel,
  });
};

const installPermissions = async (
  namespace: string,
  cluster: string,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  await Promise.allSettled([
    kubevirtK8sCreate({
      cluster,
      data: serviceAccountResource(namespace),
      model: ServiceAccountModel,
    }),
    kubevirtK8sCreate({ cluster, data: storageCheckupRole(namespace), model: RoleModel }),
  ]);
  await kubevirtK8sCreate({
    cluster,
    data: storageCheckupRoleBinding(namespace),
    model: RoleBindingModel,
  });
  try {
    await kubevirtK8sCreate({
      cluster,
      data: storageClusterRoleBinding(namespace),
      model: ClusterRoleBindingModel,
    });
  } catch (e) {
    const subjectsExist = clusterRoleBinding?.subjects;
    try {
      await kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'add',
            path: `/subjects${subjectsExist ? '/-' : ''}`,
            value: subjectsExist
              ? { kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }
              : [{ kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace }],
          },
        ],
        model: ClusterRoleBindingModel,
        resource: storageClusterRoleBinding(namespace),
      });
    } catch (err) {
      kubevirtConsole.log('Failed to patch ClusterRoleBinding: ', err?.message);
    }
  }
};

const removePermissions = async (
  namespace: string,
  cluster: string,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  try {
    await Promise.allSettled([
      kubevirtK8sDelete({
        cluster,
        model: ServiceAccountModel,
        resource: serviceAccountResource(namespace),
      }),
      kubevirtK8sDelete({ cluster, model: RoleModel, resource: storageCheckupRole(namespace) }),
    ]);
    await kubevirtK8sDelete({
      cluster,
      model: RoleBindingModel,
      resource: storageCheckupRoleBinding(namespace),
    });
    await kubevirtK8sPatch({
      cluster,
      data: [
        {
          op: 'replace',
          path: '/subjects',
          value: clusterRoleBinding?.subjects?.filter(
            (subject) => subject?.namespace !== namespace,
          ),
        },
      ],
      model: ClusterRoleBindingModel,
      resource: storageClusterRoleBinding(namespace),
    });
  } catch (err) {
    kubevirtConsole.log('Failed to remove permissions: ', err?.message);
  }
};

export const installOrRemoveCheckupsStoragePermissions = (
  namespace: string,
  cluster: string,
  isPermitted: boolean,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  try {
    return isPermitted
      ? removePermissions(namespace, cluster, clusterRoleBinding)
      : installPermissions(namespace, cluster, clusterRoleBinding);
  } catch (error) {
    return error;
  }
};

export const deleteStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
) => {
  try {
    await kubevirtK8sDelete({ cluster: getCluster(resource), model: ConfigMapModel, resource });
    for (const job of jobs) {
      await kubevirtK8sDelete({ cluster: getCluster(job), model: JobModel, resource: job });
    }
  } catch (e) {
    kubevirtConsole.log(e?.message);
  }
};

export const rerunStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
  checkupImage: string,
): Promise<IoK8sApiBatchV1Job> => {
  const isSucceeded = resource?.data?.[STATUS_SUCCEEDED] === 'true';
  await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
    cluster: getCluster(resource),
    data: [
      { op: 'remove', path: `/data/${STATUS_COMPLETION_TIME_STAMP}` },
      { op: 'remove', path: `/data/${STATUS_SUCCEEDED}` },
      { op: 'remove', path: `/data/${STATUS_FAILURE_REASON}` },
      { op: 'remove', path: `/data/${STATUS_START_TIME_STAMP}` },
      ...(isSucceeded
        ? [
            { op: 'remove', path: `/data/${STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUP_LIVE_MIGRATION}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_STORAGE_WITH_RWX}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE}` },
            { op: 'remove', path: `/data/${STORAGE_CHECKUPS_VM_VOLUME_CLONE}` },
          ]
        : []),
    ],
    model: ConfigMapModel,
    resource,
  });

  return kubevirtK8sCreate({
    cluster: getCluster(resource),
    data: storageCheckupJob(resource.metadata.name, resource.metadata.namespace, checkupImage),
    model: JobModel,
  });
};
