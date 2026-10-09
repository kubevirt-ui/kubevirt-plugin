import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  cpuManagerLabelKey,
  cpuManagerLabelValue,
} from '@kubevirt-utils/components/DedicatedResourcesModal/utils/constants';
import { getSearchLabelHREF } from '@kubevirt-utils/components/Labels/utils';
import { NodeModel } from '@kubevirt-utils/models';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const getDedicatedResourcesSearchHREF = (cluster?: string): string =>
  getSearchLabelHREF(NodeModel.kind, cpuManagerLabelKey, cpuManagerLabelValue, cluster);

export const produceVMWithDedicatedCPU = (
  vm: V1VirtualMachine,
  checked: boolean,
): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, ['spec.template.spec.domain.cpu']);
    draft.spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
  });
