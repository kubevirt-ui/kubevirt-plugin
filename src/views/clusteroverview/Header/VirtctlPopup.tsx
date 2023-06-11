import * as React from 'react';

import { ConsoleCLIDownloadModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';

import { VIRTCTL_DOWNLOADS } from '../utils/constants';
import { K8sResourceKind } from '../utils/types';

import './virtctl-popup.scss';

const VirtctlPopup: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [cliTools] = useK8sWatchResource<K8sResourceKind>({
    groupVersionKind: ConsoleCLIDownloadModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const tools = Array.isArray(cliTools) ? cliTools : [cliTools];
  const virtctlObj = tools?.find((tool) => tool?.metadata?.name === VIRTCTL_DOWNLOADS);

  const { displayName, links } = virtctlObj?.spec || {};

  const bodyContent = (
    <>
      <div className="virtctl-popup__body--message">
        {t(
          'The virtctl client is a supplemental command-line utility for managing virtualization resources from the command line.',
        )}
      </div>
      <div>
        {links?.length > 1 && (
          <ul>
            {links.map((link) => (
              <li key={`${link?.text}-${link?.href}`}>
                <ExternalLink href={link?.href} text={link?.text || displayName} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <Popover
      bodyContent={bodyContent}
      headerContent={<>{t('Download the virtctl command-line utility')}</>}
      maxWidth="350px"
      position={PopoverPosition.left}
    >
      <Button
        className="pf-m-link--align-left virtctl-popup__button"
        id="virtctl-download-links"
        variant="link"
      >
        {t('Download virtctl')}
      </Button>
    </Popover>
  );
};

export default VirtctlPopup;
