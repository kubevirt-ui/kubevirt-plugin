import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachineSchedulingLeftGrid from '../grid/leftGrid/VirtualMachineSchedulingLeftGrid';
import VirtualMachineSchedulingRightGrid from '../grid/rightGrid/VirtualMachineSchedulingRightGrid';

import './VirtualMachinesDetailsSection.scss';

type SchedulingSectionProps = {
  vm: V1VirtualMachine;
  pathname: string;
};

const SchedulingSection: React.FC<SchedulingSectionProps> = ({ vm, pathname }) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="VirtualMachinesDetailsSection">
      <a href={`${pathname}#scheduling`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Scheduling and resources requirements')}
      </Title>
      <Grid hasGutter>
        <VirtualMachineSchedulingLeftGrid vm={vm} />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <VirtualMachineSchedulingRightGrid vm={vm} />
      </Grid>
    </div>
  );
};

export default SchedulingSection;
