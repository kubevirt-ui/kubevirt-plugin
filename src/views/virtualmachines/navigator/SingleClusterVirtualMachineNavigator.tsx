import React, { FC } from 'react';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { VirtualMachineNavigatorWithFeatures } from './VirtualMachineNavigator';

const SingleClusterVirtualMachineNavigator: FC = () => {
  const [activeNamespace] = useActiveNamespace();
  return <VirtualMachineNavigatorWithFeatures activeNamespace={activeNamespace} />;
};

export default SingleClusterVirtualMachineNavigator;
