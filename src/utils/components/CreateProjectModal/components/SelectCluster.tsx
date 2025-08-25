import React, { FC, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { ManagedClusterModel } from '@multicluster/constants';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Select, SelectOption, Skeleton } from '@patternfly/react-core';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

type SelectClusterProps = {
  selectedCluster: string;
  setSelectedCluster: (newValue: string) => void;
};

const SelectCluster: FC<SelectClusterProps> = ({ selectedCluster, setSelectedCluster }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [allClusterNames, allClustersLoaded] = useFleetClusterNames();

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const onSelect = (_?: React.MouseEvent<Element, MouseEvent>, newValue?: string) => {
    setSelectedCluster(newValue);
    onToggle();
  };

  if (!allClustersLoaded) return <Skeleton />;

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
      {allClusterNames?.map((clusterName) => (
        <SelectOption key={clusterName} value={clusterName}>
          <ResourceIcon groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)} />{' '}
          {clusterName}
        </SelectOption>
      ))}
    </Select>
  );
};

export default SelectCluster;
