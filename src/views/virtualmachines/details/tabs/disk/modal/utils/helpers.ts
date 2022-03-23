import produce from 'immer';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1AddVolumeOptions,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { addNonPersistentVolume, addPersistentVolume } from '../../../../../actions/actions';
import { sourceTypes } from '../DiskFormFields/utils/constants';
import { DiskFormState, DiskSourceState } from '../state/initialState';

export const getEmptyVMDataVolumeResource = (vm: V1VirtualMachine): V1beta1DataVolume => {
  const dataVolumeResource: V1beta1DataVolume = {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      namespace: vm?.metadata?.namespace,
      name: '',
      ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })],
    },
    spec: {
      source: {},
      storage: {
        resources: {
          requests: {
            storage: '',
          },
        },
      },
    },
  };

  return dataVolumeResource;
};

export const updateVMDisks = (
  vm: V1VirtualMachine,
  updatedDisks: V1Disk[],
  updatedVolumes: V1Volume[],
  updatedDataVolumeTemplates: V1DataVolumeTemplateSpec[],
) => {
  const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    vmDraft.spec.template.spec.domain.devices.disks = updatedDisks;
    vmDraft.spec.template.spec.volumes = updatedVolumes;
    vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates;
  });
  return updatedVM;
};

export const getDiskFromState = (diskState: DiskFormState): V1Disk => ({
  name: diskState.diskName,
  [diskState.diskType]: {
    bus: diskState.diskInterface,
  },
});

export const getDataVolumeFromState = (
  vm: V1VirtualMachine,
  diskState: DiskFormState,
  diskSourceState: DiskSourceState,
): V1beta1DataVolume => {
  const dataVolume = getEmptyVMDataVolumeResource(vm);
  const dvName = `${vm?.metadata?.name}-${diskState.diskName}`;

  dataVolume.metadata.name = dvName;
  dataVolume.spec.storage.resources.requests.storage = diskState.diskSize;
  dataVolume.spec.storage.storageClassName = diskState.storageClass;
  dataVolume.spec.storage.accessModes = [diskState.accessMode];
  dataVolume.spec.storage.volumeMode = diskState.volumeMode;
  dataVolume.spec.preallocation = diskState.enablePreallocation;
  if (diskState.diskSource === sourceTypes.BLANK) {
    dataVolume.spec.source = {
      [diskState.diskSource]: {},
    };
  } else if (diskState.diskSource === sourceTypes.CLONE_PVC) {
    dataVolume.spec.source = {
      [diskState.diskSource]: {
        name: diskSourceState.pvcCloneSourceName,
        namespace: diskSourceState.pvcCloneSourceNamespace,
      },
    };
  } else if (diskState.diskSource === sourceTypes.REGISTRY) {
    dataVolume.spec.source = {
      [diskState.diskSource]: {
        url: diskSourceState.registrySource,
      },
    };
  } else {
    dataVolume.spec.source = {
      [diskState.diskSource]: {
        url: diskSourceState.urlSource,
      },
    };
  }
  return dataVolume;
};

export const getDataVolumeTemplate = (dataVolume: V1beta1DataVolume): V1DataVolumeTemplateSpec => {
  const dataVolumeTemplate: V1DataVolumeTemplateSpec = { metadata: {}, spec: {} };
  dataVolumeTemplate.metadata = { ...dataVolume.metadata };
  dataVolumeTemplate.spec = { ...dataVolume.spec };
  return dataVolumeTemplate;
};

export const getDataVolumeHotplugPromise = (
  vm: V1VirtualMachine,
  resultDataVolume: V1beta1DataVolume,
  resultDisk: V1Disk,
  detachHotplug: boolean,
) => {
  const bodyRequestAddVolume: V1AddVolumeOptions = {
    disk: resultDisk,
    name: resultDisk.name,
    volumeSource: {
      dataVolume: {
        name: resultDataVolume.metadata.name,
      },
    },
  };

  if (detachHotplug) {
    return k8sCreate({ model: DataVolumeModel, data: resultDataVolume }).then(() =>
      addNonPersistentVolume(vm, bodyRequestAddVolume),
    ) as Promise<void>;
  }
  return k8sCreate({ model: DataVolumeModel, data: resultDataVolume }).then(() =>
    addPersistentVolume(vm, bodyRequestAddVolume),
  ) as Promise<void>;
};

export const getPersistentVolumeClaimHotplugPromise = (
  vm: V1VirtualMachine,
  pvcName: string,
  resultDisk: V1Disk,
  detachHotplug: boolean,
) => {
  const bodyRequestAddVolume: V1AddVolumeOptions = {
    disk: resultDisk,
    name: resultDisk.name,
    volumeSource: {
      dataVolume: {
        name: pvcName,
      },
    },
  };

  if (detachHotplug) {
    return addNonPersistentVolume(vm, bodyRequestAddVolume);
  }
  return addPersistentVolume(vm, bodyRequestAddVolume);
};
