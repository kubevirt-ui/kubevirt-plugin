import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { EVICTION_STRATEGIES } from './constants';

export const produceVMWithEvictionStrategy = (
  vm: V1VirtualMachine,
  isChecked: boolean,
): V1VirtualMachine =>
  produce(vm, (vmDraft) => {
    ensurePath(vmDraft, ['spec.template.spec']);
    vmDraft.spec.template.spec.evictionStrategy = isChecked
      ? EVICTION_STRATEGIES.LiveMigrate
      : EVICTION_STRATEGIES.None;
  });
