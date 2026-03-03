import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { FLAG_CONSOLE_CLI_DOWNLOAD } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { clusterBasePath } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';

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
                data-test-id="virtctl-download-link"
                to={clusterBasePath.concat('command-line-tools')}
              >
                {t('Download the virtctl command-line utility')}
              </Link>{' '}
              <HelpTextIcon
                bodyContent={(hide) => (
                  <PopoverContentWithLightspeedButton
                    content={t(
                      'The virtctl client is a supplemental command-line utility for managing virtualization resources from the command line.',
                    )}
                    hide={hide}
                    promptType={OLSPromptType.VIRTCTL}
                  />
                )}
                helpIconClassName="pf-v6-u-ml-xs"
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
