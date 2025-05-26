import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { getNetworkInterfaceStateIcon } from '@virtualmachines/details/tabs/configuration/network/utils/utils';

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
  const InterfaceStateIcon = getNetworkInterfaceStateIcon(vm, network?.name);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {network?.name || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface.model || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {network?.pod ? t('Pod networking') : network?.multus?.networkName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="state">
        <InterfaceStateIcon />
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
