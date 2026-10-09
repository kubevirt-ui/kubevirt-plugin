import produce from 'immer';

import {
  type K8sIoApiCoreV1Toleration,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const produceVMWithTolerations = (
  vm: V1VirtualMachine,
  tolerations: K8sIoApiCoreV1Toleration[],
): V1VirtualMachine =>
  produce(vm, (draft) => {
    ensurePath(draft, 'spec.template.spec.tolerations');
    draft.spec.template.spec.tolerations = tolerations;
  });
