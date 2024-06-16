import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NodeSelectorDetailItem from '@kubevirt-utils/components/NodeSelectorDetailItem/NodeSelectorDetailItem';
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
              descriptionData={<NodeSelectorDetailItem nodeSelector={vmi?.spec?.nodeSelector} />}
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
