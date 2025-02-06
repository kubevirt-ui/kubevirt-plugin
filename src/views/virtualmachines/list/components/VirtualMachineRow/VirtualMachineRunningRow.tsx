import React, { FC, ReactNode } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';
import { ResourceLink, RowProps } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover from '../FirstItemListPopover/FirstItemListPopover';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';

const VirtualMachineRunningRow: FC<
  RowProps<
    V1VirtualMachine,
    {
      isSingleNodeCluster: boolean;
      status: ReactNode;
      vmi: V1VirtualMachineInstance;
      vmim: V1VirtualMachineInstanceMigration;
    }
  >
> = ({ activeColumnIDs, obj, rowData: { isSingleNodeCluster, status, vmi, vmim } }) => {
  const { t } = useKubevirtTranslation();

  const ipAddressess = vmi && getVMIIPAddressesWithName(vmi);
  return (
    <VirtualMachineRowLayout
      rowData={{
        ips: <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressess} />,
        isSingleNodeCluster,
        node: (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NodeModel)}
            name={vmi?.status?.nodeName}
            truncate
          />
        ),
        status,
        vmim,
        vmiMemory: getMemory(vmi),
      }}
      activeColumnIDs={activeColumnIDs}
      obj={obj}
    />
  );
};

export default VirtualMachineRunningRow;
