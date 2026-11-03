import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

export const buildVirtualMachineResourcePatches = (
  originalVM: V1VirtualMachine,
  updatedVM: V1VirtualMachine,
): Patch[] => {
  const patches: Patch[] = [];
  ensurePath(originalVM, 'spec.template.spec.domain');
  const originalDomain = originalVM.spec.template.spec.domain;
  const cpu = getCPU(updatedVM);
  const memory = getMemory(updatedVM);

  if (cpu && !isEqual(cpu, originalDomain.cpu)) {
    patches.push({
      op: originalDomain.cpu ? 'replace' : 'add',
      path: '/spec/template/spec/domain/cpu',
      value: cpu,
    });
  }

  if (memory && memory !== getMemory(originalVM)) {
    // A persisted VM always defines memory in one of these two places, so we only
    // ever need to replace whichever field is the source of truth.
    const memoryPath = isEmpty(originalDomain.memory?.guest)
      ? '/spec/template/spec/domain/resources/requests/memory'
      : '/spec/template/spec/domain/memory/guest';

    patches.push({
      op: 'replace',
      path: memoryPath,
      value: memory,
    });
  }

  return patches;
};
