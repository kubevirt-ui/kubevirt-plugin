import React from 'react';

import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';

import { RDPConnectorProps } from '../utils/types';

import RDP from './RDP';
import RDPServiceNotConfigured from './RDPServiceNotConfigured';

const RDPConnector: React.FC<RDPConnectorProps> = ({
  isLoading,
  rdpServiceAddressPort,
  vm,
  vmi,
}) => {
  return (
    <ComponentReady isReady={!isLoading} spinner>
      {rdpServiceAddressPort ? (
        <RDP rdp={rdpServiceAddressPort} />
      ) : (
        <RDPServiceNotConfigured vm={vm} vmi={vmi} />
      )}
    </ComponentReady>
  );
};

export default RDPConnector;
