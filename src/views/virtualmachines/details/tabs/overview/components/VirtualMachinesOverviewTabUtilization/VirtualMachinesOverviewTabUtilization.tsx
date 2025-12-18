import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardTitle,
  Divider,
  Flex,
  Grid,
  GridItem,
  PopoverPosition,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import CPUUtil from './components/CPUUtil/CPUUtil';
import MemoryUtil from './components/MemoryUtil/MemoryUtil';
import NetworkUtil from './components/NetworkUtil/NetworkUtil';
import StorageUtil from './components/StorageUtil/StorageUtil';
import TimeDropdown from './components/TimeDropdown';
import UtilizationThresholdCharts from './components/UtilizationThresholdCharts';

import './virtual-machines-overview-tab-utilization.scss';

type VirtualMachinesOverviewTabUtilizationProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabUtilization: FC<VirtualMachinesOverviewTabUtilizationProps> = ({
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Card className="VirtualMachinesOverviewTabUtilization--main">
      <CardTitle className="pf-v6-u-text-color-subtle">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <div>
            {t('Utilization')}
            <HelpTextIcon
              bodyContent={
                <Trans ns="plugin__kubevirt-plugin" t={t}>
                  <div>Donuts chart represent current values.</div>
                  <div>Sparkline charts represent data over time</div>
                </Trans>
              }
              helpIconClassName="pf-v6-u-ml-xs"
              position={PopoverPosition.right}
            />
          </div>
          <TimeDropdown />
        </Flex>
      </CardTitle>
      <Divider />
      <CardBody isFilled>
        <ComponentReady isReady={isRunning(vm)} text={t('VirtualMachine is not running')}>
          <Grid>
            <GridItem span={3}>
              <CPUUtil vmi={vmi} />
            </GridItem>
            <GridItem span={3}>
              <MemoryUtil vmi={vmi} />
            </GridItem>
            <GridItem span={3}>
              <StorageUtil vmi={vmi} />
            </GridItem>
            <GridItem span={3}>
              <NetworkUtil vmi={vmi} />
            </GridItem>
            <GridItem className="pf-v6-u-pl-md" span={12}>
              <UtilizationThresholdCharts vmi={vmi} />
            </GridItem>
          </Grid>
        </ComponentReady>
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabUtilization;
