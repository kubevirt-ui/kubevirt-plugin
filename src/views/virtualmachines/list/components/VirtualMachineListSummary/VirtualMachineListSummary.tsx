import React, { FC, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';
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

import VirtualMachineUsageItem from '../VirtualMachineUsageItem/VirtualMachineUsageItem';

import './VirtualMachineListSummary.scss';

type VirtualMachineListSummaryProps = {
  namespace: string;
  onFilterChange?: (type: string, value: FilterValue) => void;
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

  const { primaryStatuses } = getVMStatuses(vms || []);

  const { cpuRequested, cpuUsage, memoryCapacity, memoryUsage, storageCapacity, storageUsage } =
    useVMTotalsMetrics(vms, vmis);

  return (
    <ExpandableSection
      toggleContent={
        <Content className="vm-list-summary__expand-section-toggle" component="h3">
          <ProjectDiagramIcon className="vm-list-summary__expand-section-toggle-icon" />{' '}
          {namespace ?? t('All projects summary')}
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
                onFilterChange={() => onFilterChange('status', { selected: [ERROR] })}
                status={ERROR}
              />
              <VMStatusItem
                count={primaryStatuses.Running}
                namespace={namespace}
                onFilterChange={() => onFilterChange('status', { selected: [VM_STATUS.Running] })}
                status={VM_STATUS.Running}
              />
              <VMStatusItem
                count={primaryStatuses.Stopped}
                namespace={namespace}
                onFilterChange={() => onFilterChange('status', { selected: [VM_STATUS.Stopped] })}
                status={VM_STATUS.Stopped}
              />
              <VMStatusItem
                count={primaryStatuses.Paused}
                namespace={namespace}
                onFilterChange={() => onFilterChange('status', { selected: [VM_STATUS.Paused] })}
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
