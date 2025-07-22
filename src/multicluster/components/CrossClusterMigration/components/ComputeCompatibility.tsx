import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem, Title } from '@patternfly/react-core';

type ComputeCompatibilityProps = {
  nodesArchs: string[];
  vmArchs: string[];
};

const ComputeCompatibility: FC<ComputeCompatibilityProps> = ({ nodesArchs, vmArchs }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <Title className="cross-cluster-migration-title" headingLevel="h5">
        {t('Compute compatibility')}
      </Title>

      <Split>
        <SplitItem isFilled>
          <div>
            <Title className="cross-cluster-migration-title" headingLevel="h6">
              {t('Source cluster')}
            </Title>
            <div>{vmArchs.join(', ')}</div>
          </div>
        </SplitItem>
        <SplitItem isFilled>
          <div>
            <Title className="cross-cluster-migration-title" headingLevel="h6">
              {t('Target cluster')}
            </Title>
            <div>{nodesArchs.join(', ')}</div>
          </div>
        </SplitItem>
      </Split>
    </div>
  );
};

export default ComputeCompatibility;
