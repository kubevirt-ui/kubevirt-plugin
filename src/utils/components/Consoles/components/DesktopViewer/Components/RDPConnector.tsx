import React from 'react';

import { RDPConnectorProps } from '../utils/types';

import RDP from './RDP';
import RdpServiceNotConfigured from './RdpServiceNotConfigured';

const RDPConnector: React.FC<RDPConnectorProps> = ({ rdpServiceAddressPort, vm }) => {
  return rdpServiceAddressPort ? (
    <RDP rdp={rdpServiceAddressPort} />
  ) : (
    <RdpServiceNotConfigured vm={vm} />
  );
};

export default RDPConnector;
