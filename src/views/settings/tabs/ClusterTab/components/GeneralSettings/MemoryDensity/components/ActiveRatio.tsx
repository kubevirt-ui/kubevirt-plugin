import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, Skeleton, Split, SplitItem } from '@patternfly/react-core';

type ActiveRatioProps = {
  appliedRatio: null | number;
  isLoadingRatio: boolean;
};

const ActiveRatio: FC<ActiveRatioProps> = ({ appliedRatio, isLoadingRatio }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Split hasGutter>
      <SplitItem>
        <Content>
          {t('Active ratio:')}{' '}
          {isLoadingRatio ? (
            <Skeleton width="60px" />
          ) : (
            <strong>
              {typeof appliedRatio === 'number' ? `${appliedRatio}%` : t('No running VMs')}
            </strong>
          )}
        </Content>
      </SplitItem>
      <SplitItem>
        <HelpTextIcon
          bodyContent={t(
            'The memory request ratio currently calculated across all VMs on this cluster. It reflects your active workload resources, and might differ from your requested ratio.',
          )}
          headerContent={t('Active ratio')}
        />
      </SplitItem>
    </Split>
  );
};

export default ActiveRatio;
