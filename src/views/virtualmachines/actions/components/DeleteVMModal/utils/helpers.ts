import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { deleteSecret } from '@kubevirt-utils/resources/secret/utils';
import { compareOwnerReferences, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch, K8sResourceCommon, OwnerReference } from '@openshift-console/dynamic-plugin-sdk';

export const getResourceKey = (resource: K8sResourceCommon) =>
  `${resource.kind}/${getNamespace(resource)}/${getName(resource)}`;

export const isResourceShared = (sharableVolumes: V1Volume[], resource: K8sResourceCommon) =>
  sharableVolumes.some(
    (volume) =>
      volume?.dataVolume?.name === getName(resource) ||
      volume?.persistentVolumeClaim?.claimName === getName(resource),
  );

export const isResourceSavedByDefault = (
  resource: K8sResourceCommon,
  sharableVolumes: V1Volume[],
): boolean => {
  if (resource.kind === PersistentVolumeClaimModel.kind) return true;
  return isResourceShared(sharableVolumes, resource);
};

export const findPVCOwner = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  resources: K8sResourceCommon[],
) =>
  resources.find((resource) =>
    pvc?.metadata?.ownerReferences?.find((owner) => owner.uid === resource.metadata.uid),
  );

export const updateVolumeResources = (
  resources: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[],
  vmOwnerRef: OwnerReference,
) =>
  (resources || []).map((resource) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/ownerReferences',
          value: resource?.metadata?.ownerReferences?.filter(
            (ref) => !compareOwnerReferences(ref, vmOwnerRef),
          ),
        },
      ],
      model:
        resource.kind === PersistentVolumeClaimModel.kind
          ? PersistentVolumeClaimModel
          : DataVolumeModel,
      resource,
    }),
  );

export const updateSnapshotResources = (
  resources: V1beta1VirtualMachineSnapshot[],
  vmOwnerRef: OwnerReference,
) =>
  (resources || []).map((resource) =>
    k8sPatch({
      data: [
        {
          op: 'replace',
          path: '/metadata/ownerReferences',
          value: resource?.metadata?.ownerReferences?.filter(
            (ref) => !compareOwnerReferences(ref, vmOwnerRef),
          ),
        },
      ],
      model: VirtualMachineSnapshotModel,
      resource,
    }),
  );

export const deleteSecrets = (secrets: IoK8sApiCoreV1Secret[]) =>
  (secrets || []).map((secret) => deleteSecret(secret));

export const detachDataVolumeTemplates = (
  vm: V1VirtualMachine,
  dataVolumesToSave: V1beta1DataVolume[],
) => {
  const dataVolumeTemplates = getDataVolumeTemplates(vm);

  const indexes = dataVolumesToSave
    .map((dataVolume) =>
      dataVolumeTemplates.findIndex(
        (dataVolumeTemplate) => getName(dataVolumeTemplate) === getName(dataVolume),
      ),
    )
    .filter((index) => index !== -1)
    .sort((a, b) => b - a);

  if (isEmpty(indexes)) return;

  return k8sPatch({
    data: indexes.map((index) => ({ op: 'remove', path: `/spec/dataVolumeTemplates/${index}` })),
    model: VirtualMachineModel,
    resource: vm,
  });
};

const MODEL_BY_KIND: Record<string, typeof DataVolumeModel> = {
  [PersistentVolumeClaimModel.kind]: PersistentVolumeClaimModel,
  [VirtualMachineSnapshotModel.kind]: VirtualMachineSnapshotModel,
};

export const getResourceGroupVersionKind = (resource: K8sResourceCommon) =>
  modelToGroupVersionKind(MODEL_BY_KIND[resource.kind] || DataVolumeModel);
