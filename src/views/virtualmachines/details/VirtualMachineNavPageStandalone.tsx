import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import VirtualMachineNavPage from './VirtualMachineNavPage';

const VirtualMachineNavPageStandalone: FC = () => {
  const { cluster, name, ns } = useParams<{ cluster?: string; name: string; ns: string }>();
  return <VirtualMachineNavPage cluster={cluster} name={name} namespace={ns} />;
};

export default VirtualMachineNavPageStandalone;
