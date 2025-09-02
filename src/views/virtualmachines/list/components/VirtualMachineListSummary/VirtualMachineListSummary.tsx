import React, { FC, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { ERROR } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { getVMStatuses } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import VMStatusItem from '@overview/OverviewTab/vm-statuses-card/VMStatusItem';
import {
  Card,
  CardTitle,
  Content,
  Divider,
  ExpandableSection,
  Flex,
  FlexItem,
  Grid,
} from '@patternfly/react-core';
import { ProjectDiagramIcon } from '@patternfly/react-icons';
import useVMTotalsMetrics from '@virtualmachines/list/hooks/useVMTotalsMetrics';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import VirtualMachineUsageItem from '../VirtualMachineUsageItem/VirtualMachineUsageItem';

import useSummaryTitle from './hooks/useSummaryTitle';

import './VirtualMachineListSummary.scss';

type VirtualMachineListSummaryProps = {
  namespace: string;
  onFilterChange?: OnFilterChange;
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const VirtualMachineListSummary: FC<VirtualMachineListSummaryProps> = ({
  namespace,
  onFilterChange,
  vmis,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const summaryTitle = useSummaryTitle(namespace);

  const { primaryStatuses } = getVMStatuses(vms || []);

  const { cpuRequested, cpuUsage, memoryCapacity, memoryUsage, storageCapacity, storageUsage } =
    useVMTotalsMetrics(vmis);

  const onStatusChange = (status: 'Error' | VM_STATUS) => () =>
    onFilterChange(VirtualMachineRowFilterType.Status, { selected: [status] });

  return (
    <ExpandableSection
      toggleContent={
        <Content className="vm-list-summary__expand-section-toggle" component="h3">
          <ProjectDiagramIcon className="vm-list-summary__expand-section-toggle-icon" />{' '}
          {summaryTitle}
        </Content>
      }
      className="vm-list-summary__expand-section"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((prev) => !prev)}
    >
      <Card className="vm-list-summary" data-test-id="vm-list-summary">
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
          <FlexItem grow={{ default: 'grow' }}>
            <CardTitle component="h5">
              {t('Virtual Machines ({{count}})', { count: vms?.length })}
            </CardTitle>
            <Grid hasGutter>
              <VMStatusItem
                count={primaryStatuses.Error}
                namespace={namespace}
                onFilterChange={onStatusChange(ERROR)}
                status={ERROR}
              />
              <VMStatusItem
                count={primaryStatuses.Running}
                namespace={namespace}
                onFilterChange={onStatusChange(VM_STATUS.Running)}
                status={VM_STATUS.Running}
              />
              <VMStatusItem
                count={primaryStatuses.Stopped}
                namespace={namespace}
                onFilterChange={onStatusChange(VM_STATUS.Stopped)}
                status={VM_STATUS.Stopped}
              />
              <VMStatusItem
                count={primaryStatuses.Paused}
                namespace={namespace}
                onFilterChange={onStatusChange(VM_STATUS.Paused)}
                status={VM_STATUS.Paused}
              />
            </Grid>
          </FlexItem>
          <Divider
            orientation={{
              default: 'vertical',
            }}
          />
          <FlexItem grow={{ default: 'grow' }}>
            <CardTitle component="h5">{t('Usage')}</CardTitle>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              spaceItems={{ default: 'spaceItemsNone' }}
            >
              <VirtualMachineUsageItem
                capacityText={`Requested of ${cpuRequested}`}
                metricName="CPU"
                usageText={cpuUsage}
              />
              <VirtualMachineUsageItem
                capacityText={`Used of ${memoryCapacity}`}
                metricName="Memory"
                usageText={memoryUsage}
              />
              <VirtualMachineUsageItem
                capacityText={`Used of ${storageCapacity}`}
                metricName="Storage"
                usageText={storageUsage}
              />
            </Flex>
          </FlexItem>
        </Flex>
      </Card>
    </ExpandableSection>
  );
};

export default VirtualMachineListSummary;
