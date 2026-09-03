// Extracted from utils.ts
// Root: src/views/virtualmachines/details/tabs/configuration/details/utils/utils.ts

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const updateDisks = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
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
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateVolumes = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/volumes`,
        value: getVolumes(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
