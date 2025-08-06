import React, { FC, useMemo } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import { FormGroup } from '@patternfly/react-core';

type ClusterFieldProps = {
  clusters: string[];
  setClusters: (clusters: string[]) => void;
};

const ClusterField: FC<ClusterFieldProps> = ({ clusters, setClusters }) => {
  const { t } = useKubevirtTranslation();

  const [allClusters] = useAllClusters();

  const clusterNames = useMemo(() => allClusters.map((cluster) => getName(cluster)), [allClusters]);

  return (
    <FormGroup label={t('Cluster')}>
      <MultiSelectTypeahead
        allResourceNames={clusterNames}
        data-test="adv-search-vm-cluster"
        emptyValuePlaceholder={t('All clusters')}
        selectedResourceNames={clusters}
        selectPlaceholder={t('Select cluster')}
        setSelectedResourceNames={setClusters}
      />
    </FormGroup>
  );
};

export default ClusterField;
