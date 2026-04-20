import React, { FCC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import ApplicationAwareQuota from './components/ApplicationAwareQuota/ApplicationAwareQuota';
import AutoComputeCPULimits from './components/AutoComputeCPULimits/AutoComputeCPULimits';
import KernelSamepageMerging from './components/KernelSamepageMerging/KernelSamepageMerging';

type ResourceManagementSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

const ResourceManagementSection: FCC<ResourceManagementSectionProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.resourceManagement}
      toggleText={t('Resource management')}
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <AutoComputeCPULimits
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <KernelSamepageMerging
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
        <StackItem isFilled>
          <ApplicationAwareQuota
            hyperConvergeConfiguration={hyperConvergeConfiguration}
            newBadge={newBadge}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default ResourceManagementSection;
