import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutoComputeCPULimits from './components/AutoComputeCPULimits/AutoComputeCPULimits';
import KernelSamepageMerging from './components/KernelSamepageMerging/KernelSamepageMerging';

type ResourceManagementSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const ResourceManagementSection: FC<ResourceManagementSectionProps> = ({
  hyperConvergeConfiguration,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Resource management')}>
      <Stack hasGutter>
        <StackItem isFilled>
          <AutoComputeCPULimits hyperConvergeConfiguration={hyperConvergeConfiguration} />
        </StackItem>
        <StackItem isFilled>
          <KernelSamepageMerging hyperConvergeConfiguration={hyperConvergeConfiguration} />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default ResourceManagementSection;
