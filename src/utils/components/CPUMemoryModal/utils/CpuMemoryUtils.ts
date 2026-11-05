import produce from 'immer';

import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDomain } from '@kubevirt-utils/resources/vm';
import { type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

const GI = 'Gi';
const MI = 'Mi';
const TI = 'Ti';

const unitsConvertor = new Proxy(
  {
    Gi: GI,
    Mi: MI,
    Ti: TI,
  },
  {
    // eslint-disable-next-line require-jsdoc
    get(target, prop) {
      return target[prop] || '';
    },
  },
);

export const getMemorySize = (
  sourceMemory: { [key: string]: string } | string,
): { size: number; unit: string } => {
  if (typeof sourceMemory === 'string') {
    const [size, unit] = sourceMemory?.split?.(/(\d+)/g).filter(Boolean);
    return { size: +size || 0, unit: unitsConvertor[unit] };
  }
  return { size: +sourceMemory?.size || 0, unit: unitsConvertor[sourceMemory?.unit] };
};

export const memorySizesTypes = [MI, GI, TI];

// Mutates a draft VM in place. Use within an immer producer, so it can be shared
// by both VM and Template flows (the Template flow produces the Template and
// mutates the embedded VM draft).
export const applyCPUMemoryToVMDraft = (
  vmDraft: V1VirtualMachine,
  cpu: undefined | V1CPU,
  memory: number | undefined,
  memoryUnit: QuantityUnit | undefined,
): void => {
  if (cpu) {
    ensurePath(vmDraft, 'spec.template.spec.domain.cpu');

    vmDraft.spec.template.spec.domain.cpu = cpu;
  }

  if (memory && memoryUnit) {
    const memoryString = `${memory}${memoryUnit}`;

    if (isEmpty(getDomain(vmDraft)?.memory?.guest)) {
      // in case memory is not set in domain.memory.guest, it must be set in domain.resources.requests.memory
      ensurePath(vmDraft, 'spec.template.spec.domain.resources.requests.memory');
      vmDraft.spec.template.spec.domain.resources.requests.memory = memoryString;
    } else {
      ensurePath(vmDraft, 'spec.template.spec.domain.memory.guest');
      vmDraft.spec.template.spec.domain.memory.guest = memoryString;
    }
  }
};

export const applyCPUMemoryToVM = (
  vm: V1VirtualMachine,
  cpu: undefined | V1CPU,
  memory: number | undefined,
  memoryUnit: QuantityUnit | undefined,
): V1VirtualMachine =>
  produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    applyCPUMemoryToVMDraft(vmDraft, cpu, memory, memoryUnit);
  });
