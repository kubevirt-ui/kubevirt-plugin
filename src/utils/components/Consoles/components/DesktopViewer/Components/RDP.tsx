import React from 'react';
import { createUseStyles } from 'react-jss';

import { RDPProps } from '../utils/types';

import ManualConnection from './ManualConnection';
import RemoteViewer from './RemoteViewer';

const useStyles = createUseStyles({
  consoleDesktopViewer: {
    display: 'grid',
    gap: 'var(--pf-t-global--spacer--md)',
    gridArea: 'main',
    gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
  },
});

const RDP: React.FunctionComponent<RDPProps> = ({
  children = null,
  rdp = null,
  spice = null,
  vnc = null,
  ...props
}) => (
  <div className={useStyles().consoleDesktopViewer}>
    <RemoteViewer
      onDownload={props?.onDownload}
      onGenerate={props?.onGenerate}
      rdp={rdp}
      spice={spice}
      textConnectWithRDP={props?.textConnectWithRDP}
      textConnectWithRemoteViewer={props?.textConnectWithRemoteViewer}
      textMoreInfo={props?.textMoreInfo}
      textMoreInfoContent={props?.textMoreInfoContent}
      textMoreRDPInfo={props?.textMoreRDPInfo}
      textMoreRDPInfoContent={props?.textMoreRDPInfoContent}
      vnc={vnc}
    >
      {children}
    </RemoteViewer>
    <ManualConnection
      rdp={rdp}
      spice={spice}
      textAddress={props?.textAddress}
      textConnectWith={props?.textConnectWith}
      textManualConnection={props?.textManualConnection}
      textNoProtocol={props?.textNoProtocol}
      textRdpAddress={props?.textRdpAddress}
      textRDPPort={props?.textRDPPort}
      textSpiceAddress={props?.textSpiceAddress}
      textSpicePort={props?.textSpicePort}
      textSpiceTlsPort={props?.textSpiceTlsPort}
      textVNCAddress={props?.textVNCAddress}
      textVNCPort={props?.textVNCPort}
      textVNCTlsPort={props?.textVNCTlsPort}
      vnc={vnc}
    />
  </div>
);

export default RDP;
