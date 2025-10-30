import React, { FC, useState } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Divider, Flex, FlexItem, Title } from '@patternfly/react-core';

import SummaryTitle from './components/SummaryTitle';
import VirtualMachineStatuses from './components/VirtualMachineStatuses';
import VirtualMachineUsage from './components/VirtualMachineUsage';

import './VirtualMachineListSummary.scss';

type VirtualMachineListSummaryProps = {
  onFilterChange?: OnFilterChange;
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const VirtualMachineListSummary: FC<VirtualMachineListSummaryProps> = ({
  onFilterChange,
  vmis,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const vmsCount = vms?.length;

  return (
    <Card className="vm-list-summary" data-test-id="vm-list-summary">
      <ExpandSectionWithCustomToggle
        customContent={
          isExpanded ? null : (
            <div className="pf-v6-u-w-100">
              <VirtualMachineStatuses
                className="pf-v6-u-w-75 pf-v6-u-mx-auto"
                onFilterChange={onFilterChange}
                vms={vms}
              />
            </div>
          )
        }
        className="vm-list-summary__expand-section"
        id="vm-list-summary-expand-section"
        isExpanded={isExpanded}
        onToggle={setIsExpanded}
        toggleContent={<SummaryTitle showVMsCount={!isExpanded} vmsCount={vmsCount} />}
      >
        <Flex className="vm-list-summary__content">
          <FlexItem className="pf-v6-u-mx-md" grow={{ default: 'grow' }}>
            <Title className="vm-list-summary__title" headingLevel="h5">
              {t('Virtual Machines ({{count}})', { count: vmsCount })}
            </Title>
            <VirtualMachineStatuses onFilterChange={onFilterChange} vms={vms} />
          </FlexItem>
          <Divider
            orientation={{
              default: 'vertical',
            }}
            className="vm-list-summary__divider--vertical pf-v6-u-mx-md"
          />
          <Divider
            orientation={{
              default: 'horizontal',
            }}
            className="vm-list-summary__divider--horizontal pf-v6-u-my-sm"
          />
          <VirtualMachineUsage vmis={vmis} />
        </Flex>
      </ExpandSectionWithCustomToggle>
    </Card>
  );
};

export default VirtualMachineListSummary;
