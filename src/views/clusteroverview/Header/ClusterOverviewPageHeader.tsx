import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { FLAG_CONSOLE_CLI_DOWNLOAD } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { clusterBasePath } from '@kubevirt-utils/utils/utils';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';

import './ClusterOverviewPageHeader.scss';

type ClusterOverviewPageHeaderProps = {
  children?: React.ReactNode;
};

const ClusterOverviewPageHeader: React.FC<ClusterOverviewPageHeaderProps> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const hasConsoleTools = useFlag(FLAG_CONSOLE_CLI_DOWNLOAD);

  return (
    <PageSection>
      <PaneHeading>
        <Title data-test-id="resource-title" headingLevel="h1">
          {t('Virtualization')}
        </Title>
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
      </PaneHeading>
    </PageSection>
  );
};

export default ClusterOverviewPageHeader;
