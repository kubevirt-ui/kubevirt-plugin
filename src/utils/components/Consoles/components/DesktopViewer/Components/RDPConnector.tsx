import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import React from 'react';

import { RDPConnectorProps } from '../utils/types';

import RDP from './RDP';
import RDPServiceNotConfigured from './RDPServiceNotConfigured';

const RDPConnector: React.FC<RDPConnectorProps> = ({
  rdpServiceAddressPort,
  vm,
  vmi,
  isLoading,
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
