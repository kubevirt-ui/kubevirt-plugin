import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
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
        {getNetworkNameLabel(t, { network }) || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        {iface?.macAddress}
      </TableData>
    </>
  );
};

export default VirtualMachineInstancePageNetworkTabRow;
