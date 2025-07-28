import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, Split, SplitItem, Title } from '@patternfly/react-core';

import './VersionCompatibility.scss';

const VersionCompatibility = ({
  sourceClusterVersion,
  sourceKubevirtVersion,
  targetClusterVersion,
  targetKubevirtVersion,
}: {
  sourceClusterVersion: string;
  sourceKubevirtVersion: string;
  targetClusterVersion: string;
  targetKubevirtVersion: string;
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div>
      <Title className="cross-cluster-migration-title" headingLevel="h5">
        {t('Version compatibility')}
      </Title>

      <Title className="cross-cluster-migration-title" headingLevel="h6">
        {t('Openshift version')}
      </Title>

      <Split>
        <SplitItem isFilled>
          <div>
            <Title headingLevel="h6">{t('Source cluster')}</Title>
            <div>{sourceClusterVersion ?? t('Not available')}</div>
          </div>
        </SplitItem>
        <SplitItem isFilled>
          <div>
            <Title headingLevel="h6">{t('Target cluster')}</Title>
            <div>{targetClusterVersion ?? t('Not available')}</div>
          </div>
        </SplitItem>
      </Split>

      <Divider className="ccm-version-compatibility__divider" />

      <Title className="cross-cluster-migration-title" headingLevel="h6">
        {t('Virtualization operator version')}
      </Title>

      <Split>
        <SplitItem isFilled>
          <div>
            <Title headingLevel="h6">{t('Source cluster')}</Title>
            <div>{sourceKubevirtVersion ?? t('Not available')}</div>
          </div>
        </SplitItem>
        <SplitItem isFilled>
          <div>
            <Title headingLevel="h6">{t('Target cluster')}</Title>
            <div>{targetKubevirtVersion ?? t('Not available')}</div>
          </div>
        </SplitItem>
      </Split>
    </div>
  );
};

export default VersionCompatibility;
