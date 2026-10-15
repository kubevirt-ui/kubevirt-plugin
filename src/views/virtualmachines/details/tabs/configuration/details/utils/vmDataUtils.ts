import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

export const buildVirtualMachineResourcePatches = (updatedVM: V1VirtualMachine): Patch[] => [
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
];
