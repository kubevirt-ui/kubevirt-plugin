import produce from 'immer';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1AddVolumeOptions,
  type V1DataVolumeTemplateSpec,
  type V1Disk,
  type V1RemoveVolumeOptions,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildOwnerReference, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { addPersistentVolume, removeVolume } from '@virtualmachines/actions/actions';

import { HotPlugFeatures } from './constants';
import { getSourceFromVolume } from './diskValidation';
import { SourceTypes, type V1DiskFormState } from './types';

export const getRemoveHotplugPromise = (
  vm: V1VirtualMachine,
  diskName: string,
): Promise<string> => {
  const bodyRequestRemoveVolume: V1RemoveVolumeOptions = {
    name: diskName,
  };
  return removeVolume(vm, bodyRequestRemoveVolume);
};

const getDataVolumeHotplugPromise = (
  vm: V1VirtualMachine,
  resultDataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
  resultDisk: V1Disk,
): Promise<string> => {
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
  }).then(() => addPersistentVolume(vm, bodyRequestAddVolume));
};

const getPersistentVolumeClaimHotplugPromise = (
  vm: V1VirtualMachine,
  pvcName: string,
  resultDisk: V1Disk,
): Promise<string> => {
  const bodyRequestAddVolume: V1AddVolumeOptions = {
    disk: resultDisk,
    name: resultDisk.name,
    volumeSource: {
      persistentVolumeClaim: {
        claimName: pvcName,
      },
    },
  };

  return addPersistentVolume(vm, bodyRequestAddVolume);
};

export const hotplugPromise = (
  vmObj: V1VirtualMachine,
  diskState: V1DiskFormState,
): Promise<string> => {
  const diskSource = getSourceFromVolume(diskState.volume, diskState.dataVolumeTemplate);

  if (diskSource === SourceTypes.PVC) {
    return getPersistentVolumeClaimHotplugPromise(
      vmObj,
      diskState?.volume?.persistentVolumeClaim?.claimName,
      diskState.disk,
    );
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

export const isDeclarativeHotplugVolumesEnabled = (featureGates: string[]): boolean =>
  featureGates?.includes(HotPlugFeatures.DeclarativeHotplugVolumes) ?? false;

export const isHotPluggableEnabled = (featureGates: string[]): boolean =>
  isDeclarativeHotplugVolumesEnabled(featureGates) &&
  !featureGates?.includes(HotPlugFeatures.HotplugVolumes);
