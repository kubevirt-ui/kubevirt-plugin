import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';
import { ERROR } from '@overview/OverviewTab/vm-statuses-card/utils/constants';
import { getVMStatuses } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import VMStatusItem from '@overview/OverviewTab/vm-statuses-card/VMStatusItem';
import { Card, CardTitle, Content, ExpandableSection, Grid } from '@patternfly/react-core';
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
        <Content className="vm-list-summary__expand-section-toggle" component="h3">
          <ProjectDiagramIcon className="vm-list-summary__expand-section-toggle-icon" />{' '}
          {namespace ?? ALL_PROJECTS}
        </Content>
      }
      className="vm-list-summary__expand-section"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((prev) => !prev)}
    >
      <Card className="vm-list-summary" data-test-id="vm-list-summary">
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
      </Card>
    </ExpandableSection>
  );
};

export default VirtualMachineListSummary;
