import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1AddVolumeOptions,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1RemoveVolumeOptions,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  buildOwnerReference,
  getAnnotation,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { getBootDisk, getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { ensurePath, getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { isDNS1123Label } from '@kubevirt-utils/utils/validation';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { addPersistentVolume, removeVolume } from '@virtualmachines/actions/actions';

import { HotPlugFeatures } from './constants';
import { SourceTypes, V1DiskFormState } from './types';

export const getEmptyVMDataVolumeResource = (
  vm: V1VirtualMachine,
  createOwnerReference?: boolean,
): V1beta1DataVolume => ({
  apiVersion: `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`,
  kind: DataVolumeModel.kind,
  metadata: {
    name: '',
    namespace: vm?.metadata?.namespace,
    ...(createOwnerReference ?? vm?.metadata?.uid
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

export const getRemoveHotplugPromise = (vm: V1VirtualMachine, diskName: string) => {
  const bodyRequestRemoveVolume: V1RemoveVolumeOptions = {
    name: diskName,
  };
  return removeVolume(vm, bodyRequestRemoveVolume);
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

const getDataVolumeHotplugPromise = (
  vm: V1VirtualMachine,
  resultDataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
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

  return kubevirtK8sCreate({
    cluster: getCluster(vm),
    data: resultDataVolume,
    model: DataVolumeModel,
    ns: getNamespace(resultDataVolume),
  }).then(() => addPersistentVolume(vm, bodyRequestAddVolume)) as Promise<void>;
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

export const hotplugPromise = (vmObj: V1VirtualMachine, diskState: V1DiskFormState) => {
  const diskSource = getSourceFromVolume(diskState.volume, diskState.dataVolumeTemplate);

  if (diskSource === SourceTypes.PVC) {
    return getPersistentVolumeClaimHotplugPromise(
      vmObj,
      diskState?.volume?.persistentVolumeClaim?.claimName,
      diskState.disk,
    );
  }
  if (diskSource === SourceTypes.UPLOAD) {
    const pvcName = `${vmObj?.metadata?.name}-${diskState.disk.name}`;
    return getPersistentVolumeClaimHotplugPromise(vmObj, pvcName, diskState.disk);
  }

  const dataVolume = produce(diskState.dataVolumeTemplate, (draftDataVolumeTemplate) => {
    draftDataVolumeTemplate.metadata.ownerReferences = [
      buildOwnerReference(vmObj, { blockOwnerDeletion: false }),
    ];

    draftDataVolumeTemplate.metadata.namespace = getNamespace(vmObj);
    draftDataVolumeTemplate.kind = DataVolumeModel.kind;
    draftDataVolumeTemplate.apiVersion = `${DataVolumeModel.apiGroup}/${DataVolumeModel.apiVersion}`;
  });

  return getDataVolumeHotplugPromise(vmObj, dataVolume, diskState.disk);
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

export const doesSourceRequireDataVolume = (diskSource: SourceTypes): boolean => {
  return [
    SourceTypes.BLANK,
    SourceTypes.CDROM,
    SourceTypes.CLONE_PVC,
    SourceTypes.DATA_SOURCE,
    SourceTypes.HTTP,
    SourceTypes.REGISTRY,
    SourceTypes.UPLOAD,
    SourceTypes.VOLUME_SNAPSHOT,
  ].includes(diskSource);
};

export const getSourceFromVolume = (
  volume: V1Volume,
  dataVolumeTemplate: V1DataVolumeTemplateSpec,
): SourceTypes => {
  if (dataVolumeTemplate?.spec?.source?.http) return SourceTypes.HTTP;

  if (dataVolumeTemplate?.spec?.source?.pvc) return SourceTypes.CLONE_PVC;

  if (dataVolumeTemplate?.spec?.source?.registry) return SourceTypes.REGISTRY;

  if (dataVolumeTemplate?.spec?.source?.blank) return SourceTypes.BLANK;

  if (dataVolumeTemplate?.spec?.source?.upload) return SourceTypes.UPLOAD;

  if (dataVolumeTemplate?.spec?.source?.snapshot) return SourceTypes.VOLUME_SNAPSHOT;

  if (dataVolumeTemplate?.spec?.sourceRef) return SourceTypes.DATA_SOURCE;

  if (volume?.persistentVolumeClaim) return SourceTypes.PVC;

  if (volume?.containerDisk) return SourceTypes.EPHEMERAL;

  return SourceTypes.OTHER;
};

export const diskModalTitle = (isEditDisk: boolean, isVMRunning: boolean) => {
  if (isEditDisk) return t('Edit disk');

  return isVMRunning ? t('Add disk (hot plugged)') : t('Add disk');
};

export const getOS = (vm: V1VirtualMachine) =>
  getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);

export const getOSNameWithoutVersionNumber = (osName: string): string => {
  const name = osName?.match(/[a-zA-Z]+/g);
  return name?.[0];
};

export const doesDataVolumeTemplateHaveDisk = (vm: V1VirtualMachine, diskName: string) => {
  const diskVolume = getVolumes(vm)?.find((volume) => volume.name === diskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === diskVolume?.dataVolume?.name,
  );

  return !isEmpty(dataVolumeTemplate);
};

export const createDataVolumeName = (vm: V1VirtualMachine, diskName: string) => {
  const middlePart = [getName(vm), diskName].filter(isDNS1123Label).join('-').substring(0, 53);
  // prefix: 2
  // middlePart: max 53
  // suffix: 6
  // hyphens: max 2
  // together: max 63
  return `dv-${middlePart}${!middlePart || middlePart.endsWith('-') ? '' : '-'}${getRandomChars(
    6,
  )}`;
};

const getVolumeSourceForMount = (diskState: V1DiskFormState, isHotPluggable: boolean) => {
  if (diskState.dataVolumeTemplate) {
    return {
      dataVolume: {
        name: diskState.dataVolumeTemplate.metadata.name,
        ...(isHotPluggable && { hotpluggable: true }),
      },
    };
  }
  return {
    persistentVolumeClaim: {
      claimName: diskState.volume.persistentVolumeClaim.claimName,
      ...(isHotPluggable && { hotpluggable: true }),
    },
  };
};

export const mountISOToCDROM = async (
  vm: V1VirtualMachine,
  diskState: V1DiskFormState,
  isHotPluggable: boolean,
): Promise<V1VirtualMachine> => {
  const newVolumeSource = getVolumeSourceForMount(diskState, isHotPluggable);

  return produceVMDisks(vm, (draftVM) => {
    // Find the index of the existing CD-ROM volume, if it exists
    const volumes = draftVM.spec.template.spec.volumes || [];
    const volumeIndex = volumes.findIndex((volume) => volume.name === diskState.disk.name);

    const newVolume = {
      name: diskState.disk.name,
      ...newVolumeSource,
    };

    if (volumeIndex !== -1) {
      draftVM.spec.template.spec.volumes[volumeIndex] = newVolume;
    } else {
      draftVM.spec.template.spec.volumes = [...volumes, newVolume];
    }
  });
};

export const ejectISOFromCDROM = (vm: V1VirtualMachine, cdromName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    // Find the volume to be removed
    const volumeToRemove = (draftVM.spec.template.spec.volumes || []).find(
      (volume) => volume.name === cdromName,
    );

    // If a DataVolume was used, remove its template
    if (volumeToRemove?.dataVolume?.name) {
      draftVM.spec.dataVolumeTemplates = (draftVM.spec.dataVolumeTemplates || []).filter(
        (dataVolume) => dataVolume.metadata.name !== volumeToRemove.dataVolume.name,
      );
    }

    // Remove the volume entry
    draftVM.spec.template.spec.volumes = (draftVM.spec.template.spec.volumes || []).filter(
      (volume) => volume.name !== cdromName,
    );
  });
};
export const isHotPluggableEnabled = (featureGates: string[]) => {
  if (featureGates?.includes(HotPlugFeatures.DeclarativeHotplugVolumes)) {
    if (!featureGates?.includes(HotPlugFeatures.HotplugVolumes)) {
      return true;
    }
  }
  return false;
};

export const convertDataVolumeToTemplate = (
  dataVolume: V1beta1DataVolume,
): V1DataVolumeTemplateSpec => ({
  metadata: dataVolume?.metadata,
  spec: {
    source: dataVolume.spec?.source,
    sourceRef: dataVolume.spec?.sourceRef,
    storage: {
      accessModes: dataVolume.spec.storage?.accessModes?.map((mode) => mode as any),
      resources: dataVolume.spec.storage?.resources,
    },
  },
});
