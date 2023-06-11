import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type VirtualMachineInstancePageNetworkTabRowProps = {
  activeColumnIDs: Set<string>;
  obj: any;
};

const VirtualMachineInstancePageNetworkTabRow: React.FC<
  VirtualMachineInstancePageNetworkTabRowProps
> = ({ activeColumnIDs, obj: { iface, network } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {network?.name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface?.model || '-'}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {network?.pod ? t('Pod networking') : network?.multus?.networkName || '-'}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {iface?.masquerade ? t('masquerade') : '-'}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        {iface?.macAddress}
      </TableData>
    </>
  );
};

export default VirtualMachineInstancePageNetworkTabRow;
