import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';

import Affinity from './Affinity/Affinity';
import Descheduler from './Descheduler/Descheduler';
import DedicatedResources from './DeticatedResources/DedicatedResources';
import EvictionStrategy from './EvictionStrategy/EvictionStrategy';
import NodeSelector from './NodeSelector/NodeSelector';
import Tolerations from './Tolerations/Tolerations';

type VirtualMachinesInstancePageSchedulingTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageSchedulingTab: FC<
  VirtualMachinesInstancePageSchedulingTabProps
> = ({ obj: vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Grid hasGutter>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={<NodeSelector vmi={vmi} />}
              descriptionHeader={t('Node selector')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Tolerations vmi={vmi} />}
              descriptionHeader={t('Tolerations')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Affinity vmi={vmi} />}
              descriptionHeader={t('Affinity rules')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<Descheduler vmi={vmi} />}
              descriptionHeader={t('Descheduler')}
            />
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList className="pf-c-description-list">
            <VirtualMachineDescriptionItem
              descriptionData={<DedicatedResources vmi={vmi} />}
              descriptionHeader={t('Dedicated resources')}
            />
            <VirtualMachineDescriptionItem
              descriptionData={<EvictionStrategy vmi={vmi} />}
              descriptionHeader={t('Eviction strategy')}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default VirtualMachinesInstancePageSchedulingTab;
