import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import AutoComputeCPULimits from './components/AutoComputeCPULimits/AutoComputeCPULimits';
import KernelSamepageMerging from './components/KernelSamepageMerging/KernelSamepageMerging';

const ResourceManagementSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Resource management')}>
      <Stack hasGutter>
        <StackItem isFilled>
          <AutoComputeCPULimits />
        </StackItem>
        <StackItem isFilled>
          <KernelSamepageMerging />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default ResourceManagementSection;
