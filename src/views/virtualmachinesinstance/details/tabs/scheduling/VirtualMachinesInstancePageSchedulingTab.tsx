import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Node selector')}</DescriptionListTerm>
              <DescriptionListDescription>
                <NodeSelector vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Tolerations')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Tolerations vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Affinity rules')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Affinity vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Descheduler')}</DescriptionListTerm>
              <DescriptionListDescription className="list-description">
                <Descheduler vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Dedicated resources')}</DescriptionListTerm>
              <DescriptionListDescription>
                <DedicatedResources vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Eviction strategy')}</DescriptionListTerm>
              <DescriptionListDescription>
                <EvictionStrategy vmi={vmi} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default VirtualMachinesInstancePageSchedulingTab;
