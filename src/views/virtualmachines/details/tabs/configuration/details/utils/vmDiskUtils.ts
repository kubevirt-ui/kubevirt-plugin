import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { patchVM } from '@kubevirt-utils/resources/vm/utils/patch';

import { updateBootOrder } from './vmPatchUtils';

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

/** Persist disk/volume/DVT changes, then boot order on disks and interfaces. */
export const updateDisksAndBootOrder = async (
  updatedVM: V1VirtualMachine,
): Promise<V1VirtualMachine> => {
  const afterDisks = await updateDisks(updatedVM);
  // Second patch needs the advanced resourceVersion from the first response.
  return updateBootOrder({ ...updatedVM, metadata: afterDisks.metadata });
};

export const updateVolumes = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/volumes`,
      value: getVolumes(updatedVM),
    },
  ]);
