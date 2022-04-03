import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import DedicatedResources from '../../DedicatedResources/DedicatedResources';
import EvictionStrategy from '../../EvictionStrategy/EvictionStrategy';
import Flavor from '../../Flavor/Flavor';
import VirtualMachineDescriptionItem from '../../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type VirtualMachineSchedulingLeftGridProps = {
  vm?: V1VirtualMachine;
};

const VirtualMachineSchedulingLeftGrid: React.FC<VirtualMachineSchedulingLeftGridProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <GridItem span={5}>
      <DescriptionList>
        <VirtualMachineDescriptionItem
          descriptionData={<Flavor vm={vm} />}
          descriptionHeader={t('Flavor')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<DedicatedResources vm={vm} />}
          descriptionHeader={t('Dedicated Resources')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<EvictionStrategy vm={vm} />}
          descriptionHeader={t('Eviction Strategy')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingLeftGrid;
