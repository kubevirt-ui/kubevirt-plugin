import React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ExpandableSection } from '@patternfly/react-core';

import { RDP_CONSOLE_TYPE, SPICE_CONSOLE_TYPE, VNC_CONSOLE_TYPE } from '../../utils/ConsoleConsts';
import {
  DEFAULT_RDP_FILENAME,
  DEFAULT_RDP_MIMETYPE,
  DEFAULT_VV_FILENAME,
  DEFAULT_VV_MIMETYPE,
} from '../utils/constants';
import { RemoteViewerProps } from '../utils/types';
import { downloadFile, generateDescriptorFile } from '../utils/utils';

import MoreInformationDefault from './MoreInformationDefault';

const RemoteViewer: React.FC<RemoteViewerProps> = ({
  onGenerate = generateDescriptorFile,
  onDownload = downloadFile,
  spice = null,
  vnc = null,
  rdp = null,
  textConnectWithRemoteViewer,
  textConnectWithRDP,
  textMoreInfo,
  textMoreInfoContent,
  textMoreRDPInfo,
  textMoreRDPInfoContent,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpandedDefault, setIsExpandedDefault] = React.useState<boolean>(false);
  const [isExpandedRDP, setIsExpandedRDP] = React.useState<boolean>(false);

  const console = spice || vnc;

  const onClickVV = () => {
    const type = spice ? SPICE_CONSOLE_TYPE : VNC_CONSOLE_TYPE;
    if (console) {
      const vv = onGenerate(console, type);
      return onDownload(DEFAULT_VV_FILENAME, vv?.content, vv?.mimeType || DEFAULT_VV_MIMETYPE);
    }
  };

  const onClickRDP = () => {
    const rdpFile = onGenerate(rdp, RDP_CONSOLE_TYPE);
    return onDownload(
      DEFAULT_RDP_FILENAME,
      rdpFile?.content,
      rdpFile?.mimeType || DEFAULT_RDP_MIMETYPE,
    );
  };

  return (
    <div className="pf-c-console__remote-viewer">
      <div className="pf-c-console__remote-viewer-launch">
        <Button
          className="pf-c-console__remote-viewer-launch-vv"
          onClick={onClickVV}
          isDisabled={!console}
        >
          {textConnectWithRemoteViewer || t('Launch Remote Viewer')}
        </Button>
        {!!rdp && (
          <Button onClick={onClickRDP} className="pf-c-console__remote-viewer-launch-rdp">
            {textConnectWithRDP || t('Launch Remote Desktop')}
          </Button>
        )}
      </div>
      {!!console && (
        <ExpandableSection
          toggleText={textMoreInfo || t('Remote Viewer Details')}
          isExpanded={isExpandedDefault}
          onToggle={(isExpanded) => setIsExpandedDefault(isExpanded)}
        >
          <MoreInformationDefault textMoreInfoContent={textMoreInfoContent} />
        </ExpandableSection>
      )}
      {!!rdp && (
        <ExpandableSection
          toggleText={textMoreRDPInfo || t('Remote Desktop Details')}
          isExpanded={isExpandedRDP}
          onToggle={(isExpanded) => setIsExpandedRDP(isExpanded)}
        >
          {textMoreRDPInfoContent ?? (
            <Trans t={t} ns="plugin__kubevirt-plugin">
              <p>
                Clicking &quot;Launch Remote Desktop&quot; will download an .rdp file and launch{' '}
                <i>Remote Desktop Viewer</i>.
              </p>
              <p>
                Since the RDP is native Windows protocol, the best experience is achieved when used
                on Windows-based desktop.
              </p>
              <p>
                For other operating systems, the <i>Remote Viewer</i> is recommended. If RDP needs
                to be accessed anyway, the <a href="https://www.remmina.org/wp/">Remmina</a> client
                is available.
              </p>
            </Trans>
          )}
        </ExpandableSection>
      )}
    </div>
  );
};

export default RemoteViewer;
