import { type ReactNode } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type Template } from '@kubevirt-utils/resources/template';
import { type NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

export type NetworkInterfaceModalOnSubmit = {
  interfaceLinkState?: NetworkInterfaceState;
  interfaceMACAddress: string;
  interfaceModel: string;
  interfaceType: string;
  isBootSource?: boolean;
  isLegacyPasst: boolean;
  networkName: string;
  nicName: string;
};

export type NetworkInterfaceModalProps = {
  fixedName?: boolean;
  Header?: ReactNode;
  headerText: string;
  isEdit?: boolean;
  isOpen: boolean;
  namespace?: string;
  nicPresentation?: NetworkPresentation;
  onClose: () => void;
  onSubmit: (
    args: NetworkInterfaceModalOnSubmit,
  ) => (
    obj: V1VirtualMachine,
  ) => Promise<string | Template | Template[] | V1VirtualMachine | V1VirtualMachine[] | void>;
  vm: V1VirtualMachine;
};
