import * as React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { ResourceLink, RowProps } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover from '../FirstItemListPopover/FirstItemListPopover';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';

const VirtualMachineRunningRow: React.FC<
  RowProps<
    V1VirtualMachine,
    {
      isSingleNodeCluster: boolean;
      kind: string;
      vmi: V1VirtualMachineInstance;
      vmim: V1VirtualMachineInstanceMigration;
    }
  >
> = ({ activeColumnIDs, obj, rowData: { isSingleNodeCluster, kind, vmi, vmim } }) => {
  const { t } = useKubevirtTranslation();

  const ipAddressess = vmi && getVMIIPAddresses(vmi);
  return (
    <VirtualMachineRowLayout
      rowData={{
        ips: <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressess} />,
        isSingleNodeCluster,
        kind,
        node: <ResourceLink kind="Node" name={vmi?.status?.nodeName} />,
        vmim,
      }}
      activeColumnIDs={activeColumnIDs}
      obj={obj}
    />
  );
};

export default VirtualMachineRunningRow;
