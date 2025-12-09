import React, { FC, ReactNode } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';
import { ResourceLink, RowProps } from '@openshift-console/dynamic-plugin-sdk';
import { PVCMapper } from '@virtualmachines/utils/mappers';

import FirstItemListPopover from '../FirstItemListPopover/FirstItemListPopover';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';

const VirtualMachineRunningRow: FC<
  RowProps<
    V1VirtualMachine,
    {
      pvcMapper: PVCMapper;
      status: ReactNode;
      vmi: V1VirtualMachineInstance;
      vmim: V1VirtualMachineInstanceMigration;
    }
  >
> = ({ activeColumnIDs, index, obj, rowData: { pvcMapper, status, vmi, vmim } }) => {
  const { t } = useKubevirtTranslation();

  const ipAddressess = vmi && getVMIIPAddressesWithName(vmi);
  return (
    <VirtualMachineRowLayout
      rowData={{
        ips: <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressess} />,
        node: (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(NodeModel)}
            name={vmi?.status?.nodeName}
            truncate
          />
        ),
        pvcMapper,
        status,
        vmi,
        vmim,
      }}
      activeColumnIDs={activeColumnIDs}
      index={index}
      obj={obj}
    />
  );
};

export default VirtualMachineRunningRow;
