import React, { type FC } from 'react';

import ClusterDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex } from '@patternfly/react-core';

type FamilyAvailabilityClusterSelectorProps = {
  onClusterChange: (cluster: string) => void;
  selectedCluster: string | undefined;
};

const FamilyAvailabilityClusterSelector: FC<FamilyAvailabilityClusterSelectorProps> = ({
  onClusterChange,
  selectedCluster,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      className="pf-v6-u-mb-md"
      data-test="family-availability-cluster-selector"
      gap={{ default: 'gapSm' }}
    >
      {t('Cluster')}:
      <ClusterDropdown
        includeAllClusters={false}
        onChange={onClusterChange}
        selectedCluster={selectedCluster ?? ''}
      />
    </Flex>
  );
};

export default FamilyAvailabilityClusterSelector;
