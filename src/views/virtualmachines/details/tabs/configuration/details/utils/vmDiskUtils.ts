import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { patchVM } from '@kubevirt-utils/resources/vm/utils/patch';

export const updateDisks = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/domain/devices/disks`,
      value: getDisks(updatedVM),
    },
    {
      op: 'replace',
      path: `/spec/template/spec/volumes`,
      value: getVolumes(updatedVM),
    },
    {
      op: 'replace',
      path: `/spec/dataVolumeTemplates`,
      value: getDataVolumeTemplates(updatedVM),
    },
  ]);

export const updateVolumes = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/volumes`,
      value: getVolumes(updatedVM),
    },
  ]);
