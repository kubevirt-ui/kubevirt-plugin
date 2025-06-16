import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterface } from '@kubevirt-utils/resources/vm';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const setInterfaceLinkState = (
  vm: V1VirtualMachine,
  nicName: string,
  desiredState: NetworkInterfaceState,
) =>
  produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices.interfaces']);
    const interfaceToUpdate = getInterface(draftVM, nicName);
    if (interfaceToUpdate) interfaceToUpdate.state = desiredState;
  });
