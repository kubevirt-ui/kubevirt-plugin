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
      kind: string;
      vmi: V1VirtualMachineInstance;
      vmim: V1VirtualMachineInstanceMigration;
      isSingleNodeCluster: boolean;
    }
  >
> = ({ obj, activeColumnIDs, rowData: { kind, vmi, vmim, isSingleNodeCluster } }) => {
  const { t } = useKubevirtTranslation();

  const ipAddressess = vmi && getVMIIPAddresses(vmi);
  return (
    <VirtualMachineRowLayout
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{
        kind,
        node: <ResourceLink kind="Node" name={vmi?.status?.nodeName} />,
        ips: <FirstItemListPopover items={ipAddressess} headerContent={t('IP addresses')} />,
        vmim,
        isSingleNodeCluster,
      }}
    />
  );
};

export default VirtualMachineRunningRow;
