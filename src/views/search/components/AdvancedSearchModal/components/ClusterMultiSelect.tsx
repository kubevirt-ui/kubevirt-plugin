import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import MultiSelect from './MultiSelect';

type ClusterMultiSelectProps = {
  clusters: string[];
  'data-test'?: string;
  setClusters: Dispatch<SetStateAction<string[]>>;
};

const ClusterMultiSelect: FC<ClusterMultiSelectProps> = ({
  clusters,
  'data-test': dataTest,
  setClusters,
}) => {
  const { t } = useKubevirtTranslation();
  const [clusterNames] = useFleetClusterNames();

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
