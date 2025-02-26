import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NetworkInterfaceState } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/types';
import { getInterface } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const setInterfaceLinkState = (
  vm: V1VirtualMachine,
  nicName: string,
  desiredState: NetworkInterfaceState,
) =>
  produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices.interfaces']);
    const interfaceToUpdate = getInterface(vm, nicName);
    if (interfaceToUpdate) interfaceToUpdate.state = desiredState;
  });
