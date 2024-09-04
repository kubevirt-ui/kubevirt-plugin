import {
  ClusterRoleBindingModel,
  ConfigMapModel,
  JobModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1ClusterRoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import {
  generateWithNumbers,
  KUBEVIRT_VM_LATENCY_LABEL,
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
} from '../../utils/utils';

export const STORAGE_CHECKUP_SA = 'storage-checkup-sa';
export const STORAGE_CHECKUP_ROLE = 'storage-checkup-role';
export const KUBEVIRT_STORAGE_LABEL_VALUE = 'kubevirt-vm-storage';
export const STORAGE_CLUSTER_ROLE_BINDING = 'kubevirt-storage-checkup-clustereader';
export const STORAGE_CHECKUP_TIMEOUT = 'spec.timeout';
export const STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS = 'status.result.defaultStorageClass';
export const STORAGE_CHECKUP_LIVE_MIGRATION = 'status.result.vmLiveMigration';
export const STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE = 'status.result.goldenImagesNotUpToDate';
export const STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE =
  'status.result.goldenImagesNoDataSource';
export const STORAGE_CHECKUPS_WITH_SMART_CLONE = 'status.result.storageProfilesWithSmartClone';
export const STORAGE_CHECKUPS_PVC_BOUND = 'status.result.pvcBound';
export const STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT =
  'status.result.storageProfileMissingVolumeSnapshotClass';
export const STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS =
  'status.result.storageProfilesWithSpecClaimPropertySets';
export const STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS =
  'status.result.storageProfilesWithEmptyClaimPropertySets';
export const STORAGE_CHECKUPS_STORAGE_WITH_RWX = 'status.result.storageProfilesWithRWX';
export const STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE = 'status.result.vmBootFromGoldenImage';
export const STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME = 'status.result.vmHotplugVolume';
export const STORAGE_CHECKUPS_VM_VOLUME_CLONE = 'status.result.vmVolumeClone';
export const STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS =
  'status.result.vmsWithNonVirtRbdStorageClass';
export const STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS = 'status.result.vmsWithUnsetEfsStorageClass';

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

const storageCheckupConfigMap = (
  namespace: string,
  timeOut: string,
  name: string,
): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: { 'spec.timeout': `${timeOut}m` },
  kind: 'ConfigMap',
  metadata: {
    labels: {
      [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
    },
    name,
    namespace,
  },
});

const storageCheckupJob = (name: string, namespace: string): IoK8sApiBatchV1Job => {
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
                { name: 'CONFIGMAP_NAMESPACE', value: namespace },
                { name: 'CONFIGMAP_NAME', value: name },
              ],
              image: 'quay.io/kiagnose/kubevirt-storage-checkup:main',
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
  namespace: string,
  timeOut: string,
  name: string,
): Promise<IoK8sApiBatchV1Job> => {
  await k8sCreate({
    data: storageCheckupConfigMap(namespace, timeOut, name),
    model: ConfigMapModel,
  });

  return k8sCreate({
    data: storageCheckupJob(name, namespace),
    model: JobModel,
  });
};

const installPermissions = async (
  namespace: string,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  await Promise.allSettled([
    k8sCreate({ data: serviceAccountResource(namespace), model: ServiceAccountModel }),
    k8sCreate({ data: storageCheckupRole(namespace), model: RoleModel }),
  ]);
  await k8sCreate({ data: storageCheckupRoleBinding(namespace), model: RoleBindingModel });
  try {
    await k8sCreate({
      data: storageClusterRoleBinding(namespace),
      model: ClusterRoleBindingModel,
    });
  } catch (e) {
    const subjectsExist = clusterRoleBinding?.subjects;
    try {
      await k8sPatch({
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
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  try {
    await Promise.allSettled([
      k8sDelete({ model: ServiceAccountModel, resource: serviceAccountResource(namespace) }),
      k8sDelete({ model: RoleModel, resource: storageCheckupRole(namespace) }),
    ]);
    await k8sDelete({ model: RoleBindingModel, resource: storageCheckupRoleBinding(namespace) });
    await k8sPatch({
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
  isPermitted: boolean,
  clusterRoleBinding: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  try {
    return isPermitted
      ? removePermissions(namespace, clusterRoleBinding)
      : installPermissions(namespace, clusterRoleBinding);
  } catch (error) {
    return error;
  }
};

export const deleteStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
) => {
  try {
    await k8sDelete({ model: ConfigMapModel, resource });
    for (const job of jobs) {
      await k8sDelete({ model: JobModel, resource: job });
    }
  } catch (e) {
    kubevirtConsole.log(e?.message);
  }
};

export const rerunStorageCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
): Promise<IoK8sApiBatchV1Job> => {
  const isSucceeded = resource?.data?.[STATUS_SUCCEEDED] === 'true';
  await k8sPatch<IoK8sApiCoreV1ConfigMap>({
    data: [
      { op: 'remove', path: `/data/${STATUS_COMPILATION_TIME_STAMP}` },
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

  return k8sCreate({
    data: storageCheckupJob(resource.metadata.name, resource.metadata.namespace),
    model: JobModel,
  });
};
