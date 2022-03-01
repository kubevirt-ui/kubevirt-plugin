import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, RowProps, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover, {
  getVMIIPAddresses,
} from '../FirstItemListPopover/FirstItemListPopover';

import VirtualMachineRowLayout from './VirtualMachineRowLayout';

const VirtualMachineRunningRow: React.FC<RowProps<V1VirtualMachine, { kind: string }>> = ({
  obj,
  activeColumnIDs,
  rowData: { kind },
}) => {
  const { t } = useKubevirtTranslation();

  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: {
      group: 'kubevirt.io',
      version: 'v1',
      kind: 'VirtualMachineInstance',
    },
    isList: false,
    name: obj.metadata.name,
    namespace: obj.metadata.namespace,
  });

  const ipAddressess = vmi && getVMIIPAddresses(vmi);
  return (
    <VirtualMachineRowLayout
      obj={obj}
      activeColumnIDs={activeColumnIDs}
      rowData={{
        kind,
        node: <ResourceLink kind="Node" name={vmi?.status?.nodeName} />,
        ips: <FirstItemListPopover items={ipAddressess} headerContent={t('IP Addresses')} />,
      }}
    />
  );
};

export default VirtualMachineRunningRow;
