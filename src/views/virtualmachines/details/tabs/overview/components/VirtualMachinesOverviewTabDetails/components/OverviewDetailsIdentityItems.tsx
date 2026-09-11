// Extracted from VirtualMachinesOverviewTabDetails.tsx
// Root: src/views/virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/VirtualMachinesOverviewTabDetails.tsx

import { type FC } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName, getVMStatus } from '@kubevirt-utils/resources/shared';
import { getArchitecture } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Split, SplitItem } from '@patternfly/react-core';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { printableVMStatus } from '@virtualmachines/utils';

import VirtualMachineMigrationPercentage from './VirtualMachineMigrationPercentage';
import StatusPopover from './VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';

type OverviewDetailsIdentityItemsProps = {
  timestamp: { time: string; value: number } | string;
  timestampPluralized: string;
  treeViewFoldersEnabled: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const OverviewDetailsIdentityItems: FC<OverviewDetailsIdentityItemsProps> = ({
  timestamp,
  timestampPluralized,
  treeViewFoldersEnabled,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const vmPrintableStatus = getVMStatus(vm);

  return (
    <>
      <DescriptionItem
        data-test="virtual-machine-overview-details-name"
        descriptionData={
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <span>{getName(vm)}</span>
            <ArchitectureLabel architecture={getArchitecture(vm)} />
          </Flex>
        }
        descriptionHeader={t('Name')}
      />
      {treeViewFoldersEnabled && (
        <DescriptionItem
          data-test="virtual-machine-overview-details-folder"
          descriptionData={getLabel(vm, VM_FOLDER_LABEL) ?? NO_DATA_DASH}
          descriptionHeader={t('Group')}
        />
      )}
      <DescriptionItem
        data-test="virtual-machine-overview-details-status"
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
        descriptionHeader={t('Status')}
      />
      <DescriptionItem
        data-test="virtual-machine-overview-details-created"
        descriptionData={
          timestamp !== NO_DATA_DASH ? (
            <>
              <Timestamp simple timestamp={vm?.metadata?.creationTimestamp} /> (
              {t('{{timestampPluralized}} ago', { timestampPluralized })})
            </>
          ) : (
            NO_DATA_DASH
          )
        }
        descriptionHeader={t('Created')}
      />
    </>
  );
};

export default OverviewDetailsIdentityItems;
