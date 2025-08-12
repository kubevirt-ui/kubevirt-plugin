import React, { FC, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, Spinner } from '@patternfly/react-core';

type SelectClusterProps = {
  selectedCluster: string;
  setSelectedCluster: (newValue: string) => void;
};

const SelectCluster: FC<SelectClusterProps> = ({ selectedCluster, setSelectedCluster }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [allClusters, allClustersLoaded] = useAllClusters();

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const onSelect = (_?: React.MouseEvent<Element, MouseEvent>, newValue?: string) => {
    setSelectedCluster(newValue);
    onToggle();
  };

  if (!allClustersLoaded) return <Spinner size="sm" />;

  return (
    <Select
      toggle={SelectToggle({
        'data-test-id': 'cluster-name-select',
        isExpanded: isOpen,
        isFullWidth: true,
        onClick: onToggle,
        selected: selectedCluster || t('Select cluster'),
      })}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      selected={selectedCluster}
    >
      {allClusters?.map((cluster) => {
        const clusterName = getName(cluster);
        return (
          <SelectOption key={clusterName} value={clusterName}>
            <ResourceIcon groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)} />{' '}
            {clusterName}
          </SelectOption>
        );
      })}
    </Select>
  );
};

export default SelectCluster;
