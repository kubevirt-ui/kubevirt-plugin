import React from 'react';

import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/DesktopViewer';

import { RDPProps } from '../utils/types';

import ManualConnection from './ManualConnection';
import RemoteViewer from './RemoteViewer';

import '@patternfly/react-styles/css/components/Consoles/DesktopViewer.css';

const RDP: React.FunctionComponent<RDPProps> = ({
  children = null,
  spice = null,
  vnc = null,
  rdp = null,
  ...props
}) => (
  <div className={css(styles?.consoleDesktopViewer)}>
    <RemoteViewer
      spice={spice}
      vnc={vnc}
      rdp={rdp}
      onGenerate={props?.onGenerate}
      onDownload={props?.onDownload}
      textConnectWithRemoteViewer={props?.textConnectWithRemoteViewer}
      textConnectWithRDP={props?.textConnectWithRDP}
      textMoreInfo={props?.textMoreInfo}
      textMoreRDPInfo={props?.textMoreRDPInfo}
      textMoreInfoContent={props?.textMoreInfoContent}
      textMoreRDPInfoContent={props?.textMoreRDPInfoContent}
    >
      {children}
    </RemoteViewer>
    <ManualConnection
      spice={spice}
      vnc={vnc}
      rdp={rdp}
      textManualConnection={props?.textManualConnection}
      textNoProtocol={props?.textNoProtocol}
      textConnectWith={props?.textConnectWith}
      textAddress={props?.textAddress}
      textSpiceAddress={props?.textSpiceAddress}
      textVNCAddress={props?.textVNCAddress}
      textSpicePort={props?.textSpicePort}
      textVNCPort={props?.textVNCPort}
      textSpiceTlsPort={props?.textSpiceTlsPort}
      textVNCTlsPort={props?.textVNCTlsPort}
      textRDPPort={props?.textRDPPort}
      textRdpAddress={props?.textRdpAddress}
    />
  </div>
);

export default RDP;
