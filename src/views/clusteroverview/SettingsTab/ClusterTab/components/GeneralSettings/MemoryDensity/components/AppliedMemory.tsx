import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, Skeleton, StackItem } from '@patternfly/react-core';

type AppliedMemoryProps = {
  appliedRatio: null | number;
  currentOvercommit: number;
  isLoadingRatio: boolean;
};

const AppliedMemory: FC<AppliedMemoryProps> = ({
  appliedRatio,
  currentOvercommit,
  isLoadingRatio,
}) => {
  const { t } = useKubevirtTranslation();

  const getAppliedMemoryMessage = () => {
    const appliedText = Number.isFinite(appliedRatio)
      ? `${appliedRatio}% / ${currentOvercommit}%`
      : t('No running VMs');
    return appliedText;
  };

  return (
    <StackItem>
      <Content>
        {t('Memory density applied to:')}{' '}
        {isLoadingRatio ? <Skeleton width="80px" /> : <strong>{getAppliedMemoryMessage()}</strong>}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.small}>
        {t('Reflects real-time VM memory requests across the cluster')}
      </Content>
    </StackItem>
  );
};

export default AppliedMemory;
