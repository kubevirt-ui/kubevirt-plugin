import produce from 'immer';
import { type Draft } from 'immer';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  type V1beta1StorageSpec,
  type V1Disk,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMIDevices } from '@kubevirt-utils/resources/vmi';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

const addDiskToVM = (draftVM: Draft<V1VirtualMachine>, diskToPersist: V1Disk): void => {
  const disks = getDisks(draftVM) ?? [];

  if (isEmpty(diskToPersist) || disks.some((disk) => disk.name === diskToPersist.name)) return;

  disks.push({ ...diskToPersist, serial: null });

  draftVM.spec.template.spec.domain.devices.disks = disks;
};

const addDataVolumeToVM = async (
  draftVM: Draft<V1VirtualMachine>,
  dataVolumeName: string,
): Promise<void> => {
  const dataVolumeTemplates = getDataVolumeTemplates(draftVM);

  if (dataVolumeTemplates.some((dataVolume) => dataVolume.metadata.name === dataVolumeName)) return;

  const originDataVolume = await kubevirtK8sGet<V1beta1DataVolume>({
    cluster: getCluster(draftVM),
    model: DataVolumeModel,
    name: dataVolumeName,
    ns: getNamespace(draftVM),
  });

  dataVolumeTemplates.push({
    metadata: {
      name: dataVolumeName,
    },
    spec: {
      source: {
        pvc: {
          name: dataVolumeName,
          namespace: getNamespace(draftVM),
        },
      },
      storage: originDataVolume?.spec?.storage as V1beta1StorageSpec,
    },
  });
};

const removeHotplugFromVolume = (volume: V1Volume): V1Volume =>
  produce(volume, (draftVolume) => {
    if (draftVolume?.dataVolume?.hotpluggable) delete draftVolume.dataVolume.hotpluggable;

    if (draftVolume?.persistentVolumeClaim?.hotpluggable)
      delete draftVolume.persistentVolumeClaim.hotpluggable;
  });

export const persistVolume = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  volumeToPersist: V1Volume,
): Promise<V1VirtualMachine> =>
  produce(vm, async (draftVM) => {
    ensurePath(draftVM, 'spec.template.spec.domain.devices');

    const vmVolumes = getVolumes(draftVM);

    const vmVolumeToPersist = vmVolumes.find((vmVolume) => vmVolume.name === volumeToPersist?.name);

    if (vmVolumeToPersist) {
      draftVM.spec.template.spec.volumes = [
        ...vmVolumes.filter((volume) => volume.name !== vmVolumeToPersist.name),
        removeHotplugFromVolume(vmVolumeToPersist),
      ];
    }

    if (!vmVolumeToPersist) {
      vmVolumes.push(removeHotplugFromVolume(volumeToPersist));
    }

    const diskToPersist = getVMIDevices(vmi)?.disks?.find(
      (disk) => disk.name === volumeToPersist.name,
    );

    addDiskToVM(draftVM, diskToPersist);

    if (!isEmpty(volumeToPersist?.dataVolume?.name))
      await addDataVolumeToVM(draftVM, volumeToPersist?.dataVolume?.name);

    return draftVM;
  });
