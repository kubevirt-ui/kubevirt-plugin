import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type VirtualMachineInstancePageNetworkTabRowProps = {
  obj: any;
  activeColumnIDs: Set<string>;
};

const VirtualMachineInstancePageNetworkTabRow: React.FC<
  VirtualMachineInstancePageNetworkTabRowProps
> = ({ obj: { iface, network }, activeColumnIDs }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {network?.name}
      </TableData>
      <TableData id="model" activeColumnIDs={activeColumnIDs}>
        {iface?.model || '-'}
      </TableData>
      <TableData id="network" activeColumnIDs={activeColumnIDs}>
        {network?.pod ? t('Pod networking') : network?.multus?.networkName || '-'}
      </TableData>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {iface?.masquerade ? t('masquerade') : '-'}
      </TableData>
      <TableData id="macAddress" activeColumnIDs={activeColumnIDs}>
        {iface?.macAddress}
      </TableData>
    </>
  );
};

export default VirtualMachineInstancePageNetworkTabRow;
