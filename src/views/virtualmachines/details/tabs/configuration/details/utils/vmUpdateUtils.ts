import {
  type V1beta1VirtualMachineClusterInstancetype,
  type V1beta1VirtualMachineInstancetype,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import { type WORKLOADS } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getDevices,
  getHostname,
  getWorkload,
} from '@kubevirt-utils/resources/vm';
import { patchVM } from '@kubevirt-utils/resources/vm/utils/patch';
import { updateVM } from '@kubevirt-utils/resources/vm/utils/update';

import { buildVirtualMachineResourcePatches } from './vmDataUtils';

export const onSubmitYAML = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  updateVM(updatedVM);

export const updateGuestSystemAccessLog = (
  updatedVM: V1VirtualMachine,
  checked: boolean,
): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/domain/devices/logSerialConsole`,
      value: checked,
    },
  ]);

export const updateDescription = (
  updatedVM: V1VirtualMachine,
  updatedDescription: string,
): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/metadata/annotations/${DESCRIPTION_ANNOTATION}`,
      value: updatedDescription,
    },
  ]);

export const updateWorkload = (
  updatedVM: V1VirtualMachine,
  newWorkload: WORKLOADS,
): Promise<V1VirtualMachine> | undefined => {
  const vmWorkload = getWorkload(updatedVM);
  if (vmWorkload === newWorkload) {
    return;
  }

  return patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/metadata/annotations/vm.kubevirt.io~1workload`,
      value: newWorkload,
    },
  ]);
};

export const updatedVirtualMachine = (
  originalVM: V1VirtualMachine,
  updatedVM: V1VirtualMachine,
): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, buildVirtualMachineResourcePatches(originalVM, updatedVM));

export const updatedInstanceType = (
  vmToBeUpdated: V1VirtualMachine,
  instanceType: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
): Promise<V1VirtualMachine> =>
  patchVM(vmToBeUpdated, [
    {
      op: 'replace',
      path: `/spec/instancetype`,
      value: { kind: instanceType.kind, name: instanceType.metadata.name },
    },
  ]);

export const updatedHostname = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/hostname`,
      value: getHostname(updatedVM),
    },
  ]);

export const updateHeadlessMode = (
  updatedVM: V1VirtualMachine,
  checked: boolean,
): Promise<V1VirtualMachine> =>
  patchVM(updatedVM, [
    {
      op: 'replace',
      path: `/spec/template/spec/domain/devices/autoattachGraphicsDevice`,
      value: checked ? false : null,
    },
  ]);

const VSOCK_DEVICE_PATH = `/spec/template/spec/domain/devices/autoattachVSOCK`;

export const updateVSOCK = (
  updatedVM: V1VirtualMachine,
  checked: boolean,
): Promise<V1VirtualMachine> => {
  const hasAutoattachVSOCK = getDevices(updatedVM)?.autoattachVSOCK;

  return patchVM(updatedVM, [
    {
      op: hasAutoattachVSOCK ? K8S_OPS.REPLACE : K8S_OPS.ADD,
      path: VSOCK_DEVICE_PATH,
      value: checked,
    },
  ]);
};
