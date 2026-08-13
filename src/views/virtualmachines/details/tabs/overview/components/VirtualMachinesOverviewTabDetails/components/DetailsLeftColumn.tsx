import React, { type FC, type ReactNode } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import NUMABadge from '@kubevirt-utils/components/badges/NUMABadge/NUMABadge';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import {
  getArchitecture,
  getInstanceTypeMatcher,
  hasNUMAConfiguration,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Flex, Split, SplitItem } from '@patternfly/react-core';
import VMNotMigratableLabel from '@virtualmachines/list/components/VMNotMigratableLabel/VMNotMigratableLabel';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { printableVMStatus } from '@virtualmachines/utils';

import InstanceTypeDescription from './InstanceTypeDescription';
import TemplateDescription from './TemplateDescription';
import VirtualMachineMigrationPercentage from './VirtualMachineMigrationPercentage';
import StatusPopover from './VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';

type DetailsLeftColumnProps = {
  cpuMemoryVM: V1VirtualMachine;
  fallback: ReactNode;
  hostname?: string;
  osName?: string;
  timestampPluralized: string;
  timezone: string;
  treeViewFoldersEnabled: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  vmPrintableStatus: string;
};

const DetailsLeftColumn: FC<DetailsLeftColumnProps> = ({
  cpuMemoryVM,
  fallback,
  hostname,
  osName,
  timestampPluralized,
  timezone,
  treeViewFoldersEnabled,
  vm,
  vmi,
  vmPrintableStatus,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList isHorizontal>
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
          vm?.metadata?.creationTimestamp ? (
            <>
              <Timestamp simple timestamp={vm.metadata.creationTimestamp} /> (
              {t('{{timestampPluralized}} ago', { timestampPluralized })})
            </>
          ) : (
            NO_DATA_DASH
          )
        }
        descriptionHeader={t('Created')}
      />
      <DescriptionItem
        data-test="virtual-machine-overview-details-os"
        descriptionData={osName ?? fallback}
        descriptionHeader={t('Operating system')}
      />
      <DescriptionItem
        data-test="virtual-machine-overview-details-cpu-memory"
        descriptionData={
          <Flex>
            <CPUMemory vm={cpuMemoryVM ?? vm} vmi={vmi} />
            {hasNUMAConfiguration(cpuMemoryVM) && <NUMABadge />}
          </Flex>
        }
        descriptionHeader={t('CPU | Memory')}
      />
      <DescriptionItem descriptionData={timezone} descriptionHeader={t('Time zone')} />
      {getInstanceTypeMatcher(vm) ? (
        <InstanceTypeDescription vm={vm} />
      ) : (
        <TemplateDescription vm={vm} />
      )}
      <DescriptionItem
        data-test="virtual-machine-overview-details-host"
        descriptionData={hostname ?? fallback}
        descriptionHeader={t('Hostname')}
      />
    </DescriptionList>
  );
};

export default DetailsLeftColumn;
