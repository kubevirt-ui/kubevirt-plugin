import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Grid, GridItem, Title } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';
import { WizardDescriptionItem } from '../../components/WizardDescriptionItem';

import Affinity from './components/Affinity';
import DedicatedResources from './components/DedicatedResources';
import EvictionStrategy from './components/EvictionStrategy';
import NodeSelector from './components/NodeSelector';
import Tolerations from './components/Tolerations';

const WizardSchedulingTab: React.FC<WizardVMContextType> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="co-m-pane__body">
      <Title headingLevel="h2" className="co-section-heading">
        {t('Scheduling and resources requirements')}
      </Title>
      <Grid hasGutter>
        <GridItem span={6} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              title={t('Node Selector')}
              description={<NodeSelector vm={vm} />}
            />

            <WizardDescriptionItem title={t('Tolerations')} description={<Tolerations vm={vm} />} />

            <WizardDescriptionItem title={t('Affinity Rules')} description={<Affinity vm={vm} />} />
          </DescriptionList>
        </GridItem>

        <GridItem span={6} rowSpan={4}>
          <DescriptionList>
            <WizardDescriptionItem
              title={t('Dedicated Resources')}
              description={<DedicatedResources vm={vm} />}
            />

            <WizardDescriptionItem
              title={t('Eviction Strategy')}
              description={<EvictionStrategy vm={vm} />}
            />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WizardSchedulingTab;
