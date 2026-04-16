import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import {
  getMCOCheckErrorTooltip,
  getMCONotInstalledTooltip,
} from '@kubevirt-utils/hooks/useAlerts/utils/useMCOInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePrometheusAvailability } from '@kubevirt-utils/hooks/usePrometheusAvailability';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  Alert,
  AlertVariant,
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
import NoDataUtilizationBlock from './components/NoDataUtilizationBlock';
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
  const { mcoError, prometheusUnavailable } = usePrometheusAvailability(vm);

  return (
    <Card className="VirtualMachinesOverviewTabUtilization--main">
      <CardTitle className="pf-v6-u-text-color-subtle">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <div>
            {t('Utilization')}
            <HelpTextIcon
              bodyContent={(hide) => (
                <PopoverContentWithLightspeedButton
                  content={
                    <Trans ns="plugin__kubevirt-plugin" t={t}>
                      <div>Donut charts represent current values.</div>
                      <div>Sparkline charts represent data over time.</div>
                    </Trans>
                  }
                  hide={hide}
                  promptType={OLSPromptType.VM_RESOURCE_UTILIZATION}
                />
              )}
              helpIconClassName="pf-v6-u-ml-xs"
              position={PopoverPosition.right}
            />
          </div>
          {!prometheusUnavailable && <TimeDropdown />}
        </Flex>
      </CardTitle>
      <Divider />
      <CardBody isFilled>
        <ComponentReady isReady={isRunning(vm)} text={t('VirtualMachine is not running')}>
          {prometheusUnavailable && (
            <Alert
              className="pf-v6-u-mb-md"
              isInline
              title={mcoError ? getMCOCheckErrorTooltip(t) : getMCONotInstalledTooltip(t)}
              variant={AlertVariant.warning}
            />
          )}
          <Grid>
            <GridItem span={3}>
              {prometheusUnavailable ? (
                <NoDataUtilizationBlock dataTestId="util-summary-cpu" title={t('CPU')} />
              ) : (
                <CPUUtil vmi={vmi} />
              )}
            </GridItem>
            <GridItem span={3}>
              {prometheusUnavailable ? (
                <NoDataUtilizationBlock dataTestId="util-summary-memory" title={t('Memory')} />
              ) : (
                <MemoryUtil vmi={vmi} />
              )}
            </GridItem>
            <GridItem span={3}>
              <StorageUtil vmi={vmi} />
            </GridItem>
            <GridItem span={3}>
              {prometheusUnavailable ? (
                <NoDataUtilizationBlock
                  dataTestId="util-summary-network-transfer"
                  isNetworkUtil
                  title={t('Network transfer')}
                />
              ) : (
                <NetworkUtil vmi={vmi} />
              )}
            </GridItem>
            {!prometheusUnavailable && (
              <GridItem className="pf-v6-u-pl-md" span={12}>
                <UtilizationThresholdCharts vmi={vmi} />
              </GridItem>
            )}
          </Grid>
        </ComponentReady>
      </CardBody>
    </Card>
  );
};

export default VirtualMachinesOverviewTabUtilization;
