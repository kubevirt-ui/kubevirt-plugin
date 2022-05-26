import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1AddVolumeOptions,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1RemoveVolumeOptions,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  addPersistentVolume,
  removeVolume,
} from '../../../../views/virtualmachines/actions/actions';
import { sourceTypes } from '../DiskFormFields/utils/constants';
import { DiskFormState, DiskSourceState } from '../state/initialState';

export const getEmptyVMDataVolumeResource = (
  vm: V1VirtualMachine,
  createOwnerReference: boolean,
): V1beta1DataVolume => {
  const dataVolumeResource: V1beta1DataVolume = {
    apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
    kind: DataVolumeModel.kind,
    metadata: {
      namespace: vm?.metadata?.namespace,
      name: '',
      ...(createOwnerReference
        ? { ownerReferences: [buildOwnerReference(vm, { blockOwnerDeletion: false })] }
        : {}),
    },
    spec: {
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

export const produceVMDisks = (
  vm: V1VirtualMachine,
  updateDisks: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    if (!draftVM.spec.template.spec.domain.devices.disks)
      draftVM.spec.template.spec.domain.devices.disks = [];

    if (!draftVM.spec.template.spec.volumes) draftVM.spec.template.spec.volumes = [];

    if (!draftVM.spec.dataVolumeTemplates) draftVM.spec.dataVolumeTemplates = [];

    updateDisks(draftVM);
  });
};

export const requiresDataVolume = (diskSource: string): boolean => {
  return [
    sourceTypes.BLANK,
    sourceTypes.HTTP,
    sourceTypes.CLONE_PVC,
    sourceTypes.REGISTRY,
    sourceTypes.DATA_SOURCE,
  ].includes(diskSource);
};

export const getDiskFromState = (diskState: DiskFormState): V1Disk => ({
  name: diskState.diskName,
  [diskState.diskType]: {
    bus: diskState.diskInterface,
  },
});

export const getVolumeFromState = (
  vm: V1VirtualMachine,
  diskState: DiskFormState,
  diskSourceState: DiskSourceState,
  dvName: string,
): V1Volume => {
  const volume: V1Volume = {
    name: diskState.diskName,
  };
  if (requiresDataVolume(diskState.diskSource)) {
    volume.dataVolume = {
      name: dvName,
    };
  } else if (diskState.diskSource === sourceTypes.EPHEMERAL) {
    volume.containerDisk = {
      image: diskSourceState.ephemeralSource,
    };
  } else if (diskState.diskSource === sourceTypes.PVC) {
    volume.persistentVolumeClaim = {
      claimName: diskSourceState.pvcSourceName,
    };
  } else if (diskState.diskSource === sourceTypes.UPLOAD) {
    volume.persistentVolumeClaim = {
      claimName: `${vm?.metadata?.name}-${diskState.diskName}`,
    };
  }

  return volume;
};

export const getDataVolumeFromState = ({
  vm,
  diskState,
  diskSourceState,
  resultVolume,
  createOwnerReference = true,
}: {
  vm: V1VirtualMachine;
  diskState: DiskFormState;
  diskSourceState: DiskSourceState;
  resultVolume?: V1Volume;
  createOwnerReference?: boolean;
}): V1beta1DataVolume => {
  const dataVolume = getEmptyVMDataVolumeResource(vm, createOwnerReference);
  const dvName = resultVolume?.dataVolume?.name || `${vm?.metadata?.name}-${diskState.diskName}`;

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
        url: `docker://${diskSourceState.registrySource}`,
      },
    };
  } else if (diskState.diskSource === sourceTypes.HTTP) {
    dataVolume.spec.source = {
      [diskState.diskSource]: {
        url: diskSourceState.urlSource,
      },
    };
  } else if (diskState.diskSource === sourceTypes.DATA_SOURCE) {
    dataVolume.spec.sourceRef = {
      kind: DataSourceModel.kind,
      name: diskSourceState.dataSourceName,
      namespace: diskSourceState.dataSourceNamespace,
    };
  } else if (diskState.diskSource === sourceTypes.UPLOAD) {
    dataVolume.spec.source = {
      upload: {},
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

  return k8sCreate({ model: DataVolumeModel, data: resultDataVolume }).then(() =>
    addPersistentVolume(vm, bodyRequestAddVolume),
  ) as Promise<void>;
};

export const getPersistentVolumeClaimHotplugPromise = (
  vm: V1VirtualMachine,
  pvcName: string,
  resultDisk: V1Disk,
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

  return addPersistentVolume(vm, bodyRequestAddVolume);
};

export const getRemoveHotplugPromise = (vm: V1VirtualMachine, diskName: string) => {
  const bodyRequestRemoveVolume: V1RemoveVolumeOptions = {
    name: diskName,
  };
  return removeVolume(vm, bodyRequestRemoveVolume);
};
