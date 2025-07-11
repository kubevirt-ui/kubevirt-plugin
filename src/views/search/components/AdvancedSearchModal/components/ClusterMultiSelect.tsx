import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';

import MultiSelect from './MultiSelect';

type ClusterMultiSelectProps = {
  clusters: string[];
  'data-test'?: string;
  setClusters: React.Dispatch<React.SetStateAction<string[]>>;
};

const ClusterMultiSelect: FC<ClusterMultiSelectProps> = ({
  clusters,
  'data-test': dataTest,
  setClusters,
}) => {
  const { t } = useKubevirtTranslation();
  const [allClusters] = useAllClusters();

  const clusterNames = useMemo(() => allClusters.map((cluster) => getName(cluster)), [allClusters]);

  return (
    <MultiSelect
      allResourceNames={clusterNames}
      data-test={dataTest}
      emptyValuePlaceholder={t('All clusters')}
      selectedResourceNames={clusters}
      selectPlaceholder={t('Select cluster')}
      setSelectedResourceNames={setClusters}
    />
  );
};

export default ClusterMultiSelect;
