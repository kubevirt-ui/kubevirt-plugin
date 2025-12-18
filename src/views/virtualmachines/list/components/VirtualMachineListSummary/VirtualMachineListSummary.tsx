import React, { FC, useState } from 'react';
import classNames from 'classnames';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, ExpandableSection, Flex, Title } from '@patternfly/react-core';

import ClusterInfo from './components/ClusterInfo/ClusterInfo';
import VirtualMachineStatuses from './components/VirtualMachineStatuses';
import VirtualMachineUsage from './components/VirtualMachineUsage';

import './VirtualMachineListSummary.scss';

type VirtualMachineListSummaryProps = {
  vmis: V1VirtualMachineInstance[];
  vms: V1VirtualMachine[];
};

const VirtualMachineListSummary: FC<VirtualMachineListSummaryProps> = ({ vmis, vms }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <Card className="vm-list-summary" data-test-id="vm-list-summary" variant="secondary">
      <ExpandableSection
        toggleContent={
          <Title className="vm-list-summary__expand-section-toggle" headingLevel="h3">
            {t('Summary')}
          </Title>
        }
        className={classNames('vm-list-summary__expand-section', { 'pf-v6-u-mb-md': isExpanded })}
        id="vm-list-summary-expand-section"
        isExpanded={isExpanded}
        onToggle={(_, expanded) => setIsExpanded(expanded)}
      >
        <Flex
          alignItems={{ default: 'alignItemsStretch' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <ClusterInfo vms={vms} />
          <VirtualMachineStatuses vms={vms} />
          <VirtualMachineUsage vmis={vmis} />
        </Flex>
      </ExpandableSection>
    </Card>
  );
};

export default VirtualMachineListSummary;
