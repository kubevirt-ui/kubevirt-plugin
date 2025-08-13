import React, { FC, useMemo } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const ClusterField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Cluster);

  const [allClusters] = useAllClusters();

  const clusterNames = useMemo(() => allClusters.map((cluster) => getName(cluster)), [allClusters]);

  return (
    <FormGroup label={t('Cluster')}>
      <MultiSelectTypeahead
        allResourceNames={clusterNames}
        data-test="adv-search-vm-cluster"
        emptyValuePlaceholder={t('All clusters')}
        selectedResourceNames={value}
        selectPlaceholder={t('Select cluster')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default ClusterField;
