import React, { FC } from 'react';

import { Loading } from '@patternfly/quickstarts';
import { Bullseye, Grid, PageSection } from '@patternfly/react-core';

import { ApplicationAwareQuota } from '../../../form/types';
import useIsDedicatedVirtualResources from '../../../hooks/useIsDedicatedVirtualResources';
import { getHardFieldKeys, getStatus } from '../../../utils/utils';
import CPUChart from '../../components/CPUChart';
import MemoryChart from '../../components/MemoryChart';
import VMCountChart from '../../components/VMCountChart';

import QuotaDetailsGrid from './QuotaDetailsGrid';

type QuotaDetailsTabProps = {
  obj?: ApplicationAwareQuota;
};

const QuotaDetailsTab: FC<QuotaDetailsTabProps> = ({ obj: quota }) => {
  const isDedicatedVirtualResources = useIsDedicatedVirtualResources();

  if (!quota) {
    <PageSection>
      <Bullseye>
        <Loading />
      </Bullseye>
    </PageSection>;
  }

  const { hard, used } = getStatus(quota);
  const { cpu, memory, vmCount } = getHardFieldKeys(isDedicatedVirtualResources);

  return (
    <PageSection>
      <Grid hasGutter>
        {hard?.[cpu] && <CPUChart fieldKey={cpu} hard={hard} used={used} />}
        {hard?.[memory] && <MemoryChart fieldKey={memory} hard={hard} used={used} />}
        {hard?.[vmCount] && <VMCountChart fieldKey={vmCount} hard={hard} used={used} />}
      </Grid>
      <QuotaDetailsGrid quota={quota} />
    </PageSection>
  );
};

export default QuotaDetailsTab;
