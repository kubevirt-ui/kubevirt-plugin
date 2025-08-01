import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

type ClusterFieldProps = {
  clusters: string[];
  setClusters: (clusters: string[]) => void;
};

const ClusterField: FC<ClusterFieldProps> = ({ clusters, setClusters }) => {
  const { t } = useKubevirtTranslation();

  const [clusterNames] = useFleetClusterNames();

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
