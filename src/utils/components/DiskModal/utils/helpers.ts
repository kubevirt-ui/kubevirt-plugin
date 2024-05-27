import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1AddVolumeOptions,
  V1beta1DataVolumeSpec,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1RemoveVolumeOptions,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { buildOwnerReference, getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive, getDiskInterface } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import {
  appendDockerPrefix,
  ensurePath,
  isEmpty,
  removeDockerPrefix,
} from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { isRunning } from '@virtualmachines/utils';

import {
  addPersistentVolume,
  removeVolume,
} from '../../../../views/virtualmachines/actions/actions';
import { DYNAMIC } from '../components/utils/constants';

import { getInitialStateDiskForm, mapSourceTypeToVolumeType } from './constants';
import { DiskFormState, DiskModalProps, SourceTypes, VolumeTypes } from './types';

const getEmptyVMDataVolumeResource = (
  vm: V1VirtualMachine,
  createOwnerReference: boolean,
): V1beta1DataVolume => ({
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name: '',
    namespace: vm?.metadata?.namespace,
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
});

export const produceVMDisks = (
  vm: V1VirtualMachine,
  updateDisks: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    if (draftVM) {
      ensurePath(draftVM, ['spec.template.spec.domain.devices']);

      if (!draftVM.spec.template.spec.domain.devices.disks)
        draftVM.spec.template.spec.domain.devices.disks = [];

      if (!draftVM.spec.template.spec.volumes) draftVM.spec.template.spec.volumes = [];

      if (!draftVM.spec.dataVolumeTemplates) draftVM.spec.dataVolumeTemplates = [];

      updateDisks(draftVM);
    }
  });
};

export const requiresDataVolume = (diskSource: SourceTypes): boolean => {
  return [
    SourceTypes.BLANK,
    SourceTypes.CLONE_PVC,
    SourceTypes.HTTP,
    SourceTypes.REGISTRY,
  ].includes(diskSource);
};

const buildDisk = (diskState: DiskFormState): V1Disk => {
  const disk: V1Disk = {
    [diskState.diskType]: {
      bus: diskState.diskInterface,
    },
    name: diskState.diskName,
    shareable: diskState.sharable || null,
  };

  if (diskState.lunReservation && disk.lun) {
    disk.lun.reservation = true;
  }

  return disk;
};

const buildVolume = (diskState: DiskFormState, vmName: string, dvName: string) => {
  const { diskName, diskSource } = diskState;
  const volume: V1Volume = { name: diskName };

  const actions = {
    default: {
      dataVolume: { name: dvName },
    },
    [SourceTypes.EPHEMERAL]: {
      containerDisk: { image: diskState?.containerDisk?.url },
    },
    [SourceTypes.PVC]: {
      persistentVolumeClaim: { claimName: diskState?.persistentVolumeClaim?.pvcName },
    },
    [SourceTypes.UPLOAD]: {
      persistentVolumeClaim: { claimName: `${vmName}-${diskName}` },
    },
  };

  const action = actions[diskSource] || actions.default;

  Object.assign(volume, action);

  return volume;
};

const buildDataVolume = ({
  createOwnerReference = true,
  diskState,
  resultVolume,
  vm,
}: {
  createOwnerReference?: boolean;
  diskState: DiskFormState;
  resultVolume?: V1Volume;
  vm: V1VirtualMachine;
}): V1beta1DataVolume => {
  const dataVolume = getEmptyVMDataVolumeResource(vm, createOwnerReference);
  const dvName =
    resultVolume?.dataVolume?.name ||
    resultVolume?.persistentVolumeClaim?.claimName ||
    `${vm?.metadata?.name}-${diskState.diskName}`;

  dataVolume.metadata.name = dvName;

  dataVolume.spec.storage.resources.requests.storage = diskState.diskSize;
  dataVolume.spec.storage.storageClassName = diskState.storageClass;

  if (!diskState.storageProfileSettingsApplied) {
    dataVolume.spec.storage.accessModes = [diskState.accessMode];
    dataVolume.spec.storage.volumeMode = diskState.volumeMode;
  }

  dataVolume.spec.preallocation = diskState.enablePreallocation;

  const sourceMap = {
    [SourceTypes.BLANK]: {},
    [SourceTypes.CLONE_PVC]: {
      name: diskState?.pvc?.pvcName,
      namespace: diskState?.pvc?.pvcNamespace,
    },
    [SourceTypes.HTTP]: { url: diskState?.http?.url },
    [SourceTypes.REGISTRY]: { url: appendDockerPrefix(diskState?.registry?.url) },
    [SourceTypes.UPLOAD]: { upload: {} },
  };

  dataVolume.spec.source = { [diskState.diskSource]: sourceMap[diskState.diskSource] || {} };

  return dataVolume;
};

const getDataVolumeTemplate = (dataVolume: V1beta1DataVolume): V1DataVolumeTemplateSpec => {
  const dataVolumeTemplate: V1DataVolumeTemplateSpec = { metadata: {}, spec: {} };
  dataVolumeTemplate.metadata = { name: dataVolume.metadata.name };
  dataVolumeTemplate.spec = dataVolume.spec as V1beta1DataVolumeSpec;
  return dataVolumeTemplate;
};

const getDataVolumeHotplugPromise = (
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

  return k8sCreate({ data: resultDataVolume, model: DataVolumeModel }).then(() =>
    addPersistentVolume(vm, bodyRequestAddVolume),
  ) as Promise<void>;
};

const getPersistentVolumeClaimHotplugPromise = (
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

export const getRunningVMMissingDisksFromVMI = (
  vmDisks: V1Disk[],
  vmi: V1VirtualMachineInstance,
): V1Disk[] => {
  const vmDiskNames = vmDisks?.map((disk) => disk?.name);
  const missingDisksFromVMI = (vmi?.spec?.domain?.devices?.disks || [])?.filter(
    (disk) => !vmDiskNames?.includes(disk?.name),
  );
  return missingDisksFromVMI || [];
};

export const getRunningVMMissingVolumesFromVMI = (
  vmVolumes: V1Volume[],
  vmi: V1VirtualMachineInstance,
): V1Volume[] => {
  const vmVolumeNames = vmVolumes?.map((vol) => vol?.name);
  const missingVolumesFromVMI = (vmi?.spec?.volumes || [])?.filter(
    (vol) => !vmVolumeNames?.includes(vol?.name),
  );
  return missingVolumesFromVMI || [];
};

export const checkDifferentStorageClassFromBootPVC = (
  vm: V1VirtualMachine,
  selectedStorageClass: string,
): boolean => {
  const bootDiskName = getBootDisk(vm)?.name;
  const bootVolume = getVolumes(vm).find((vol) => vol?.name === bootDiskName);
  const bootDVT = getDataVolumeTemplates(vm)?.find(
    (dvt) => getName(dvt) === bootVolume?.dataVolume?.name,
  );

  const source = Boolean(bootDVT?.spec?.source?.pvc || bootDVT?.spec?.sourceRef);
  return source && bootDVT?.spec?.storage?.storageClassName !== selectedStorageClass;
};

export const hotplugPromise = (
  vmObj: V1VirtualMachine,
  diskState: DiskFormState,
  createOwnerReference = true,
) => {
  const resultDisk = buildDisk(diskState);
  if (diskState.diskSource === SourceTypes.PVC) {
    return getPersistentVolumeClaimHotplugPromise(
      vmObj,
      diskState?.persistentVolumeClaim?.pvcName,
      resultDisk,
    );
  }
  if (diskState.diskSource === SourceTypes.UPLOAD) {
    const pvcName = `${vmObj?.metadata?.name}-${diskState.diskName}`;
    return getPersistentVolumeClaimHotplugPromise(vmObj, pvcName, resultDisk);
  }
  const resultDataVolume = buildDataVolume({
    createOwnerReference,
    diskState,
    vm: vmObj,
  });
  return getDataVolumeHotplugPromise(vmObj, resultDataVolume, resultDisk);
};

export const addDisk = async (
  formData: DiskFormState,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  modalProps: Partial<DiskModalProps>,
) => {
  const { diskName, diskSource, isBootSource } = formData;
  const { createOwnerReference, onSubmit, onUploadedDataVolume, vm } = modalProps;

  const sourceRequiresDataVolume = requiresDataVolume(diskSource);
  const isVMRunning = isRunning(vm);
  let updatedVirtualMachine: V1VirtualMachine = vm;
  const vmName = getName(vm);

  if (!isVMRunning) {
    updatedVirtualMachine = produceVMDisks(vm, (vmDraft) => {
      const dvName = `${vmName}-${diskName}`;

      const resultDisk = buildDisk(formData);
      const resultVolume = buildVolume(formData, vmName, dvName);

      vmDraft.spec.template.spec.domain.devices.disks = isBootSource
        ? [resultDisk, ...(getDisks(vmDraft) || [])].map((disk, index) => ({
            ...disk,
            bootOrder: index + 1,
          }))
        : [...(getDisks(vmDraft) || []), resultDisk];

      vmDraft.spec.template.spec.volumes = [...(getVolumes(vmDraft) || []), resultVolume];

      if (sourceRequiresDataVolume) {
        const resultDataVolume = buildDataVolume({
          createOwnerReference,
          diskState: formData,
          resultVolume,
          vm: vmDraft,
        });
        const resultDataVolumeTemplate = getDataVolumeTemplate(resultDataVolume);

        vmDraft.spec.dataVolumeTemplates = resultDataVolumeTemplate && [
          ...(getDataVolumeTemplates(vmDraft) || []),
          resultDataVolumeTemplate,
        ];
      }
      return vmDraft;
    });
  }

  if (formData.diskSource === SourceTypes.UPLOAD) {
    const dataVolume = buildDataVolume({
      createOwnerReference,
      diskState: formData,
      vm,
    });
    await uploadData({
      dataVolume,
      file: formData?.upload?.uploadFile as File,
    });
    onUploadedDataVolume?.(dataVolume);
  }

  return !isVMRunning
    ? onSubmit(updatedVirtualMachine)
    : (hotplugPromise(updatedVirtualMachine, formData, createOwnerReference) as Promise<any>);
};

// Edit disk functions
const updateVolume = (
  vm: V1VirtualMachine,
  oldVolume: V1Volume,
  diskState: DiskFormState,
): V1Volume => {
  const updatedVolume = { ...oldVolume };
  if (updatedVolume.name !== diskState.diskName) {
    updatedVolume.name = diskState.diskName;
  }
  const oldVolumeSourceKey = Object.keys(oldVolume).find((key) => key !== 'name');
  const oldVolumeSource = mapSourceTypeToVolumeType[oldVolumeSourceKey];
  const newVolumeSource = mapSourceTypeToVolumeType[diskState.diskSource];
  if (oldVolumeSource !== newVolumeSource) {
    delete updatedVolume[oldVolumeSource];
  }

  if (diskState.diskSource === SourceTypes.EPHEMERAL) {
    updatedVolume.containerDisk = {
      image: diskState.containerDisk.url,
    };
  } else if (diskState.diskSource === SourceTypes.PVC) {
    updatedVolume.persistentVolumeClaim = {
      claimName: diskState.persistentVolumeClaim.pvcName,
    };
  } else if (diskState.diskSource === SourceTypes.UPLOAD) {
    return {
      name: diskState.diskName,
      persistentVolumeClaim: {
        claimName: `${vm?.metadata?.name}-${diskState.diskName}`,
      },
    };
  }
  return updatedVolume;
};

const updateVMDisks = (
  disks: V1Disk[],
  updatedDisk: V1Disk,
  initialDiskName: string,
  useAsBoot: boolean,
): V1Disk[] => {
  return useAsBoot
    ? [
        { ...updatedDisk, bootOrder: 1 },
        ...(disks || [])
          .filter((disk) => disk.name !== initialDiskName)
          .map((disk, index) => ({
            ...disk,
            // other disks should have bootOrder set to 2+
            bootOrder: 2 + index,
          })),
      ]
    : [...(disks || []).filter((d) => d?.name !== initialDiskName), updatedDisk];
};

const updateVMVolumes = (
  volumes: V1Volume[],
  updatedVolume: V1Volume,
  initialVolumeName: string,
): V1Volume[] => {
  return [
    ...(volumes?.map((volume) => {
      if (volume?.name === initialVolumeName) {
        return updatedVolume;
      }
      return volume;
    }) || [updatedVolume]),
  ];
};

const updateVMDataVolumeTemplates = (
  dataVolumeTemplates: V1DataVolumeTemplateSpec[],
  updatedDataVolumeTemplate: V1DataVolumeTemplateSpec,
  initialDiskSource: SourceTypes,
  sourceRequiresDataVolume: boolean,
  updatedVmVolumes: V1Volume[],
): V1DataVolumeTemplateSpec[] => {
  const updatedDataVolumeTemplates = () => {
    if (sourceRequiresDataVolume) {
      if (requiresDataVolume(initialDiskSource)) {
        return [
          ...(dataVolumeTemplates || []).filter(
            (dvt) => dvt?.metadata?.name !== updatedDataVolumeTemplate?.metadata?.name,
          ),
          updatedDataVolumeTemplate,
        ];
      } else {
        return [...(dataVolumeTemplates || []), updatedDataVolumeTemplate];
      }
    }
    return dataVolumeTemplates || [];
  };

  return updatedDataVolumeTemplates().filter((dvt) =>
    updatedVmVolumes.some((volume) => volume?.dataVolume?.name === dvt.metadata.name),
  );
};

export const editDisk = async (
  initialFormData: DiskFormState,
  formData: DiskFormState,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  modalProps: Partial<DiskModalProps>,
) => {
  const { diskName, diskSource, isBootSource } = formData;
  const { createOwnerReference, onSubmit, onUploadedDataVolume, vm } = modalProps;
  const sourceRequiresDataVolume = requiresDataVolume(diskSource);
  const currentVmVolumes = getVolumes(vm);

  const volumeToUpdate = currentVmVolumes.find((volume) => volume?.name === diskName);

  const resultDisk = buildDisk(formData);
  const resultVolume = updateVolume(vm, volumeToUpdate, formData);

  const resultDataVolume =
    sourceRequiresDataVolume &&
    buildDataVolume({
      createOwnerReference,
      diskState: formData,
      resultVolume,
      vm,
    });
  const resultDataVolumeTemplate =
    sourceRequiresDataVolume && getDataVolumeTemplate(resultDataVolume);

  const updatedVMDisks = updateVMDisks(
    getDisks(vm),
    resultDisk,
    initialFormData.diskName,
    isBootSource,
  );

  const updatedVmVolumes = updateVMVolumes(
    currentVmVolumes,
    resultVolume,
    initialFormData.diskName,
  );

  const updatedDataVolumeTemplates = updateVMDataVolumeTemplates(
    getDataVolumeTemplates(vm),
    resultDataVolumeTemplate,
    initialFormData.diskSource,
    sourceRequiresDataVolume,
    updatedVmVolumes,
  );

  const updatedVM = produceVMDisks(vm, (vmDraft) => {
    vmDraft.spec.template.spec.domain.devices.disks = updatedVMDisks;
    vmDraft.spec.template.spec.volumes = updatedVmVolumes;
    vmDraft.spec.dataVolumeTemplates = updatedDataVolumeTemplates;
    return vmDraft;
  });

  if (diskSource === SourceTypes.UPLOAD) {
    if (onUploadedDataVolume) onUploadedDataVolume(resultDataVolume);

    await uploadData({
      dataVolume: resultDataVolume,
      file: formData?.upload?.uploadFile as File,
    });
  }
  return onSubmit(updatedVM);
};

const getSourceFromDataVolume = (dataVolume: V1DataVolumeTemplateSpec): SourceTypes => {
  if (dataVolume.spec?.source?.http) return SourceTypes.HTTP;
  if (dataVolume.spec?.source?.pvc) return SourceTypes.CLONE_PVC;
  if (dataVolume.spec?.source?.registry) return SourceTypes.REGISTRY;
  if (dataVolume.spec?.source?.blank) return SourceTypes.BLANK;
  return SourceTypes.OTHER;
};

export const setEditStateFromDisk = (
  disk: V1Disk,
  draftState: WritableDraft<Omit<DiskFormState, 'diskName'>>,
) => {
  draftState.diskInterface = getDiskInterface(disk);
  draftState.diskType = diskTypes[getDiskDrive(disk)];
  draftState.sharable = disk.shareable;
  draftState.lunReservation = disk.lun?.reservation;
};

export const getVolumeSource = (volume: V1Volume) => {
  // volume consists of 2 keys:
  // name and one of: containerDisk/cloudInitNoCloud
  return Object.keys(volume).find((key: VolumeTypes) =>
    [
      VolumeTypes.CONTAINER_DISK,
      VolumeTypes.DATA_VOLUME,
      VolumeTypes.PERSISTENT_VOLUME_CLAIM,
    ].includes(key),
  );
};

export const setEphemeralURL = (
  volume: V1Volume,
  draftState: WritableDraft<Omit<DiskFormState, 'diskName'>>,
) => {
  draftState.containerDisk = { url: volume?.containerDisk?.image };
  draftState.diskSource = SourceTypes.EPHEMERAL;
  draftState.diskSize = DYNAMIC;
};

export const setOtherSource = (draftState: WritableDraft<Omit<DiskFormState, 'diskName'>>) => {
  draftState.diskSize = null;
  draftState.diskSource = SourceTypes.OTHER;
};

export const getEditDiskState = (vm: V1VirtualMachine, diskName: string): DiskFormState => {
  const state = produce(getInitialStateDiskForm(), (draftState) => {
    draftState.isBootSource = getBootDisk(vm)?.name === diskName;

    const disk = getDisks(vm)?.find(({ name }) => name === diskName);
    if (!isEmpty(disk)) setEditStateFromDisk(disk, draftState);

    const volumes = getVolumes(vm);
    const volume = volumes?.find(({ name }) => name === diskName);

    const volumeSource = getVolumeSource(volume);

    if (volumeSource === VolumeTypes.CONTAINER_DISK) {
      setEphemeralURL(volume, draftState);
      return draftState;
    }

    if (volumeSource === VolumeTypes.PERSISTENT_VOLUME_CLAIM) {
      draftState.persistentVolumeClaim = { pvcName: volume.persistentVolumeClaim?.claimName };
      draftState.diskSource = SourceTypes.PVC;
      return draftState;
    }

    const dataVolumeTemplates = getDataVolumeTemplates(vm);
    const dataVolumeTemplate = dataVolumeTemplates?.find(
      (dataVolume) => dataVolume.metadata.name === volume.dataVolume?.name,
    );

    if (
      dataVolumeTemplate &&
      (dataVolumeTemplate.spec?.source || dataVolumeTemplate.spec?.sourceRef)
    ) {
      draftState.diskSource = getSourceFromDataVolume(dataVolumeTemplate);

      if (dataVolumeTemplate.spec?.source?.http) {
        draftState.http = { url: dataVolumeTemplate.spec.source.http.url };
      }

      if (dataVolumeTemplate.spec?.source?.pvc) {
        draftState.pvc = {
          pvcName: dataVolumeTemplate.spec.source.pvc.name,
          pvcNamespace: dataVolumeTemplate.spec.source.pvc.namespace,
        };
      }

      if (dataVolumeTemplate.spec?.source?.registry) {
        draftState.registry = {
          url: removeDockerPrefix(dataVolumeTemplate.spec.source.registry.url),
        };
      }

      draftState.diskSize =
        dataVolumeTemplate.spec?.storage?.resources?.requests?.storage ||
        dataVolumeTemplate.spec?.pvc?.resources?.requests?.storage;

      const applySPSettings =
        !dataVolumeTemplate?.spec?.storage?.accessModes &&
        !dataVolumeTemplate?.spec?.storage?.volumeMode;

      draftState.storageProfileSettingsApplied = applySPSettings;
      draftState.accessMode = !applySPSettings
        ? dataVolumeTemplate?.spec?.storage?.accessModes?.[0]
        : null;
      draftState.volumeMode = !applySPSettings
        ? dataVolumeTemplate?.spec?.storage?.volumeMode
        : null;

      draftState.storageClass = dataVolumeTemplate?.spec?.storage?.storageClassName;
      return draftState;
    }

    setOtherSource(draftState);
  });

  return {
    ...state,
    diskName,
  };
};

export const editVMDisk = (
  vm: V1VirtualMachine,
  initialDiskFormState: DiskFormState,
  newDiskFormState: DiskFormState,
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>,
) => {
  const updatedVM = produceVMDisks(vm, (vmDraft) => {
    const vmDisks = getDisks(vmDraft);

    const vmVolumes = getVolumes(vmDraft);
    const diskIndexEdited = vmDisks.findIndex(
      (disk) => disk.name === initialDiskFormState.diskName,
    );
    const volumeEdited = vmVolumes.find((volume) => volume.name === initialDiskFormState.diskName);

    vmDisks.splice(diskIndexEdited, 1, buildDisk(newDiskFormState));
    volumeEdited.name = newDiskFormState.diskName;

    if (newDiskFormState.isBootSource && !initialDiskFormState.isBootSource) {
      vmDisks.forEach((disk) => delete disk.bootOrder);

      vmDisks[diskIndexEdited].bootOrder = 1;
    }

    if (!newDiskFormState.isBootSource && initialDiskFormState.isBootSource) {
      delete vmDisks[diskIndexEdited].bootOrder;
    }

    return vmDraft;
  });

  return onSubmit(updatedVM);
};
