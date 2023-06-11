import * as React from 'react';

import { FLAG_CONSOLE_CLI_DOWNLOAD } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';

import RestoreGettingStartedButton from './RestoreGettingStartedButton';
import VirtctlPopup from './VirtctlPopup';

type ClusterOverviewPageHeaderProps = {
  children?: React.ReactNode;
};

const ClusterOverviewPageHeader: React.FC<ClusterOverviewPageHeaderProps> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const hasConsoleTools = useFlag(FLAG_CONSOLE_CLI_DOWNLOAD);

  return (
    <div className="co-m-nav-title">
      <h1 className="co-m-pane__heading">
        <div className="co-m-pane__name co-resource-item">
          <span className="co-resource-item__resource-name" data-test-id="resource-title">
            {t('Virtualization')}
          </span>
        </div>
        <span>
          {hasConsoleTools && <VirtctlPopup />}
          {children}
          <span className="co-m-pane__heading-badge">
            <RestoreGettingStartedButton />
          </span>
        </span>
      </h1>
    </div>
  );
};

export default ClusterOverviewPageHeader;
