// Extracted from utils.ts
// Root: src/views/virtualmachines/details/tabs/configuration/details/utils/utils.ts

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachineClusterInstancetype,
  type V1beta1VirtualMachineInstancetype,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { type WORKLOADS } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getCPU,
  getHostname,
  getMemory,
  getWorkload,
} from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch, kubevirtK8sUpdate } from '@multicluster/k8sRequests';

export const onSubmitYAML = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sUpdate({
    cluster: getCluster(updatedVM),
    data: updatedVM,
    model: VirtualMachineModel,
    name: getName(updatedVM),
    ns: getNamespace(updatedVM),
  });

export const updateGuestSystemAccessLog = (
  updatedVM: V1VirtualMachine,
  checked: boolean,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/logSerialConsole`,
        value: checked,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateDescription = (
  updatedVM: V1VirtualMachine,
  updatedDescription: string,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/metadata/annotations/${DESCRIPTION_ANNOTATION}`,
        value: updatedDescription,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateWorkload = (
  updatedVM: V1VirtualMachine,
  newWorkload: WORKLOADS,
): Promise<V1VirtualMachine> | undefined => {
  const vmWorkload = getWorkload(updatedVM);
  if (vmWorkload === newWorkload) {
    return;
  }

  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/metadata/annotations/vm.kubevirt.io~1workload`,
        value: newWorkload,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updatedVirtualMachine = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/cpu`,
        value: getCPU(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/memory/guest`,
        value: getMemory(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updatedInstanceType = (
  vmToBeUpdated: V1VirtualMachine,
  instanceType: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: vmToBeUpdated?.cluster,
    data: [
      {
        op: 'replace',
        path: `/spec/instancetype`,
        value: { kind: instanceType.kind, name: instanceType.metadata.name },
      },
    ],
    model: VirtualMachineModel,
    resource: vmToBeUpdated,
  });

export const updatedHostname = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/hostname`,
        value: getHostname(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateHeadlessMode = (
  updatedVM: V1VirtualMachine,
  checked: boolean,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/autoattachGraphicsDevice`,
        value: checked ? false : null,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
