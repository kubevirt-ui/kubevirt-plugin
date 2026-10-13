import produce from 'immer';

import {
  type K8sIoApiCoreV1Affinity,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const produceVMWithAffinity = (
  vm: V1VirtualMachine,
  affinity: K8sIoApiCoreV1Affinity,
): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, 'spec.template.spec.affinity');
    draft.spec.template.spec.affinity = affinity;
  });
