import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { toNetworkNameLabel } from '@kubevirt-utils/constants/network-columns';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { getConfigInterfaceStateFromVm } from '@virtualmachines/details/tabs/configuration/network/utils/utils';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  obj: NetworkPresentation;
};

const NetworkInterfaceRow: FC<
  RowProps<
    NetworkPresentation,
    { onUpdateVM?: (updateVM: V1VirtualMachine) => Promise<void>; vm: V1VirtualMachine }
  >
> = ({ activeColumnIDs, obj: { iface, network }, rowData: { onUpdateVM, vm } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {network?.name || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {toNetworkNameLabel(t, { network }) || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="state">
        <NetworkIcon configuredState={getConfigInterfaceStateFromVm(vm, network?.name)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {getPrintableNetworkInterfaceType(iface)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        {iface.macAddress || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <NetworkInterfaceActions
          nicName={network?.name}
          nicPresentation={{ iface, network }}
          onUpdateVM={onUpdateVM}
          vm={vm}
        />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
