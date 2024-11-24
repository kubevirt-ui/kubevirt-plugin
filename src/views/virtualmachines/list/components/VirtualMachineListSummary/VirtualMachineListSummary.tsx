import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';
import { ERROR } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { getVMStatuses } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import VMStatusItem from '@overview/OverviewTab/vm-statuses-card/VMStatusItem';
import {
  Card,
  CardHeader,
  CardTitle,
  Divider,
  ExpandableSection,
  Grid,
  Text,
} from '@patternfly/react-core';
import { ProjectDiagramIcon } from '@patternfly/react-icons';

import './VirtualMachineListSummary.scss';

type VirtualMachineListSummaryProps = {
  namespace: string;
  onFilterChange?: (type: string, value: FilterValue) => void;
  vms: V1VirtualMachine[];
};

const VirtualMachineListSummary: FC<VirtualMachineListSummaryProps> = ({
  namespace,
  onFilterChange,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const { primaryStatuses } = getVMStatuses(vms || []);

  return (
    <ExpandableSection
      toggleContent={
        <Text className="vm-list-summary__expand-section-toggle" component="h3">
          <ProjectDiagramIcon className="vm-list-summary__expand-section-toggle-icon" />{' '}
          {namespace ?? ALL_PROJECTS}
        </Text>
      }
      className="vm-list-summary__expand-section"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((prev) => !prev)}
    >
      <Card className="vm-list-summary__card" data-test-id="vm-list-summary">
        <CardHeader className="vm-statuses-card__header">
          <CardTitle component="h5">
            {t('Virtual Machines ({{count}})', { count: vms?.length })}
          </CardTitle>
        </CardHeader>
        <div className="vm-statuses-card__body">
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
        </div>
        <Divider />
      </Card>
    </ExpandableSection>
  );
};

export default VirtualMachineListSummary;
