import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { FLAG_CONSOLE_CLI_DOWNLOAD } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { clusterBasePath } from '@kubevirt-utils/utils/utils';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';

import './ClusterOverviewPageHeader.scss';

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
          {hasConsoleTools && (
            <>
              <Link
                className="cluster-overview-header__virtctl-link"
                to={clusterBasePath.concat('command-line-tools')}
              >
                {t('Download the virtctl command-line utility')}
              </Link>{' '}
              <HelpTextIcon
                bodyContent={t(
                  'The virtctl client is a supplemental command-line utility for managing virtualization resources from the command line.',
                )}
                helpIconClassName="cluster-overview-header__virtctl-link--help-icon"
              />
            </>
          )}
          {children}
        </span>
      </h1>
    </div>
  );
};

export default ClusterOverviewPageHeader;
