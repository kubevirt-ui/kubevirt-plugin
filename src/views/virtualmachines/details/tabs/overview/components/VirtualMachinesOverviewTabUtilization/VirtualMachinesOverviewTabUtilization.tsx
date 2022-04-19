import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm/hooks';
import { Card, CardBody, CardTitle, Divider, Grid, GridItem } from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';

import ComponentReady from './components/ComponentReady/ComponentReady';
import CPUUtil from './components/CPUUtil/CPUUtil';
import MemoryUtil from './components/MemoryUtil/MemoryUtil';
import NetworkUtil from './components/NetworkUtil/NetworkUtil';
import StorageUtil from './components/StorageUtil/StorageUtil';
import TimeDropdown from './components/TimeDropdown';
import { ONE_HOUR } from './utils/utils';

import './virtual-machines-overview-tab-utilization.scss';

type VirtualMachinesOverviewTabUtilizationProps = {
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabUtilization: React.FC<
  VirtualMachinesOverviewTabUtilizationProps
> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { vmi, pods } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const [duration, setDuration] = React.useState(ONE_HOUR);
  const isVMRunning = vm?.status?.printableStatus === printableVMStatus.Running;

  return (
    <Card className="VirtualMachinesOverviewTabUtilization--main">
      <div className="title">
        <CardTitle className="text-muted">{t('Utilization')}</CardTitle>
        <ComponentReady isReady={isVMRunning}>
          <TimeDropdown setDuration={setDuration} />
        </ComponentReady>
      </div>
      <Divider />
      <CardBody isFilled>
        <ComponentReady isReady={isVMRunning} text={t('VirtualMachine is not running')}>
          <Grid>
            <GridItem span={3}>
              <CPUUtil duration={duration} vmi={vmi} vm={vm} pods={pods} />
            </GridItem>
            <GridItem span={3}>
              <MemoryUtil duration={duration} vmi={vmi} vm={vm} />
            </GridItem>
            <GridItem span={3}>
              <StorageUtil duration={duration} vmi={vmi} vm={vm} />
            </GridItem>
            <GridItem span={3}>
              <NetworkUtil duration={duration} vmi={vmi} vm={vm} />
            </GridItem>
          </Grid>
        </ComponentReady>
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabUtilization;
