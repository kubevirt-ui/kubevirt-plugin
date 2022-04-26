import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Title } from '@patternfly/react-core';

import { ManualConnectionProps } from '../utils/types';

import Detail from './Detail';

const ManualConnection: React.FunctionComponent<ManualConnectionProps> = ({
  spice = null,
  vnc = null,
  rdp = null,
  textManualConnection,
  textNoProtocol,
  textConnectWith,
  textAddress,
  textSpiceAddress,
  textVNCAddress,
  textSpicePort,
  textVNCPort,
  textSpiceTlsPort,
  textVNCTlsPort,
  textRDPPort,
  textRdpAddress,
}) => {
  const { t } = useKubevirtTranslation();
  const msg =
    spice || vnc
      ? textConnectWith || t('Connect with any viewer application for following protocols')
      : textNoProtocol || t('No connection available.');
  const address = spice && vnc && spice?.address === vnc?.address && spice?.address;
  const rdpAddress = rdp && rdp?.address !== address ? rdp?.address : null;

  return (
    <div className="pf-c-console__manual-connection">
      <Title headingLevel="h2" size="3xl">
        {textManualConnection || t('Manual Connection')}
      </Title>
      <p>{msg}</p>
      <DescriptionList>
        {address && <Detail title={textAddress || t('Address')} value={address} />}
        {!address && spice && (
          <Detail title={textSpiceAddress || t('SPICE Address')} value={spice?.address} />
        )}
        {rdpAddress && <Detail title={textRdpAddress || t('RDP Address')} value={rdpAddress} />}
        {spice?.port && <Detail title={textSpicePort || t('SPICE Port')} value={spice?.port} />}
        {spice?.tlsPort && (
          <Detail title={textSpiceTlsPort || t('SPICE TLS Port')} value={spice?.tlsPort} />
        )}
        {!address && vnc && (
          <Detail title={textVNCAddress || t('VNC Address')} value={vnc?.address} />
        )}
        {vnc?.port && <Detail title={textVNCPort || t('VNC Port')} value={vnc?.port} />}
        {vnc?.tlsPort && (
          <Detail title={textVNCTlsPort || t('VNC TLS Port')} value={vnc?.tlsPort} />
        )}
        {rdp?.port && <Detail title={textRDPPort || t('RDP Port')} value={rdp?.port} />}
      </DescriptionList>
    </div>
  );
};

export default ManualConnection;
