import { produce } from 'immer';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BinaryUnit, type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const MEMORY_UNITS = [BinaryUnit.Mi, BinaryUnit.Gi, BinaryUnit.Ti];

export const applyCPUMemoryToVM = (
  vm: V1VirtualMachine,
  cpu: undefined | V1CPU,
  memory: number | undefined,
  memoryUnit: QuantityUnit | undefined,
): V1VirtualMachine =>
  produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    if (cpu) {
      ensurePath(vmDraft, 'spec.template.spec.domain.cpu');
      const domain = vmDraft.spec?.template?.spec?.domain;
      if (domain) {
        domain.cpu = cpu;
      }
    }

    if (memory && memoryUnit) {
      ensurePath(vmDraft, 'spec.template.spec.domain.memory.guest');
      const domainMemory = vmDraft.spec?.template?.spec?.domain?.memory;
      if (domainMemory) {
        domainMemory.guest = `${memory}${memoryUnit}`;
      }
    }
  });
