import { useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

type NetworkInterfaceSnapshot = {
  interfaceLinkState: NetworkInterfaceState;
  interfaceMACAddress: string | undefined;
  interfaceModel: string;
  interfaceType: string;
  isBootSource: boolean;
  networkName: string | null;
  nicName: string;
};

export const useNoChangesMade = (currentState: NetworkInterfaceSnapshot): boolean => {
  const [initialState] = useState(currentState);
  return isEqualObject(currentState, initialState);
};
