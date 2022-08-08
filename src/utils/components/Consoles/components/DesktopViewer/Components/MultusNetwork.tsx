import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isGuestAgentConnected } from '@kubevirt-utils/resources/vmi/utils/guest-agent';
import { Alert } from '@patternfly/react-core';

import { DEFAULT_RDP_PORT } from '../utils/constants';
import { MultusNetworkProps } from '../utils/types';

import RDP from './RDP';

const MultusNetwork: React.FC<MultusNetworkProps> = ({ vmi, selectedNetwork }) => {
  const { t } = useKubevirtTranslation();
  const guestAgent = isGuestAgentConnected(vmi);

  if (!guestAgent) {
    return (
      <Alert variant="warning" isInline title={t('Missing guest agent')}>
        {t('Guest agent is not installed on VirtualMachine')}
      </Alert>
    );
  }

  if (!selectedNetwork || !selectedNetwork?.ip) {
    return (
      <Alert variant="warning" isInline title={t('Networks misconfigured')}>{`${t(
        'No IP address is reported for network interface',
      )} ${selectedNetwork?.name || ''}`}</Alert>
    );
  }

  const rdp = {
    address: selectedNetwork?.ip,
    port: DEFAULT_RDP_PORT,
  };

  return <RDP rdp={rdp} />;
};

export default MultusNetwork;
