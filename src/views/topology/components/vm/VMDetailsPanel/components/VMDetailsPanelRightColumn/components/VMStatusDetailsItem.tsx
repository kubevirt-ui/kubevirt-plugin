import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { Split, SplitItem } from '@patternfly/react-core';
import VirtualMachineMigrationPercentage from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineMigrationPercentage';
import StatusPopover from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';
import { printableVMStatus } from '@virtualmachines/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMStatusDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMStatusDetailsItem: FC<VMStatusDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  const vmPrintableStatus = getVMStatus(vm);

  return (
    <DescriptionItem
      descriptionData={
        <Split hasGutter isWrappable>
          <SplitItem>
            <StatusPopover vm={vm} vmi={vmi} />
            {vmPrintableStatus === printableVMStatus.Migrating && (
              <VirtualMachineMigrationPercentage vm={vm} />
            )}
          </SplitItem>
          <VMNotMigratableLabel vm={vm} />
        </Split>
      }
      className="topology-vm-details-panel__item"
      data-test-id="virtual-machine-overview-details-status"
      descriptionHeader={t('Status')}
    />
  );
};

export default VMStatusDetailsItem;
