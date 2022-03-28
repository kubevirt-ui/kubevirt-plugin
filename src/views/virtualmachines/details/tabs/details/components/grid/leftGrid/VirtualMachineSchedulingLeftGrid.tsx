import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, GridItem } from '@patternfly/react-core';

import Affinity from '../../Affinity/Affinity';
import Descheduler from '../../Descheduler/Descheduler';
import NodeSelector from '../../NodeSelector/NodeSelector';
import Tolerations from '../../Tolerations/Tolerations';
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
          descriptionData={<NodeSelector vm={vm} />}
          descriptionHeader={t('Node Selector')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Tolerations vm={vm} />}
          descriptionHeader={t('Tolerations')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Affinity vm={vm} />}
          descriptionHeader={t('Affinity Rules')}
        />
        <VirtualMachineDescriptionItem
          descriptionData={<Descheduler vm={vm} />}
          descriptionHeader={t('Descheduler')}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default VirtualMachineSchedulingLeftGrid;
