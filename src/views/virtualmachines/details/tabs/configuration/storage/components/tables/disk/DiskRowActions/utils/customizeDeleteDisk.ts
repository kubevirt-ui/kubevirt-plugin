import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { produceVMDisks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';

type CustomizeDeleteDiskParams = {
  cancelUpload?: () => Promise<boolean>;
  diskName: string;
  isCDROM: boolean;
  onDiskUpdate: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

export const customizeDeleteDisk = async ({
  cancelUpload,
  diskName,
  isCDROM,
  onDiskUpdate,
  vm,
}: CustomizeDeleteDiskParams): Promise<V1VirtualMachine> => {
  if (isCDROM) {
    await cancelUpload?.();
  }

  const newVM = produceVMDisks(vm, (draftVM) => {
    const volumeToDelete = getVolumes(vm).find((vol) => vol.name === diskName);
    draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM)?.filter(
      (disk) => disk.name !== (volumeToDelete?.name ?? diskName),
    );
    draftVM.spec.template.spec.volumes = getVolumes(draftVM)?.filter(
      (vol) => vol.name !== (volumeToDelete?.name ?? diskName),
    );
    draftVM.spec.dataVolumeTemplates = getDataVolumeTemplates(draftVM)?.filter(
      (dataVolume) => getName(dataVolume) !== volumeToDelete?.dataVolume?.name,
    );
  });

  return onDiskUpdate(newVM);
};
