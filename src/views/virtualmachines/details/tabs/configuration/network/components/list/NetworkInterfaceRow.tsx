import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EphemeralBadge from '@kubevirt-utils/components/badges/EphemeralBadge/EphemeralBadge';
import PendingBadge from '@kubevirt-utils/components/badges/PendingBadge/PendingBadge';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { toNetworkNameLabel } from '@kubevirt-utils/constants/network-columns';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import { getConfigInterfaceState, getRuntimeInterfaceState } from '../../utils/utils';

import NetworkInterfaceActions from './NetworkInterfaceActions';
import { SimpeNicPresentation } from './NetworkInterfaceList';

export type NetworkInterfaceRowProps = {
  obj: SimpeNicPresentation;
};

const NetworkInterfaceRow: FC<
  RowProps<
    SimpeNicPresentation,
    {
      vm: V1VirtualMachine;
      vmi: V1VirtualMachineInstance;
    }
  >
> = ({
  activeColumnIDs,
  obj: {
    config,
    configLinkState,
    iface,
    interfaceName,
    isInterfaceEphemeral,
    isPending,
    isSRIOV,
    network,
    runtimeLinkState,
    type,
  },
  rowData: { vm },
}) => {
  const { t } = useKubevirtTranslation();
  const nicName = network?.name;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {!nicName && interfaceName ? <Label>{interfaceName}</Label> : nicName || NO_DATA_DASH}
        {isPending && !isInterfaceEphemeral && <PendingBadge />}
        {isInterfaceEphemeral && <EphemeralBadge />}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="model">
        {iface?.model || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="network">
        {toNetworkNameLabel(t, { network }) || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="runtime_link_state">
        <NetworkIcon
          configuredState={getConfigInterfaceState(config?.iface, configLinkState, isSRIOV)}
          runtimeState={getRuntimeInterfaceState(runtimeLinkState)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {type}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="macAddress">
        {iface?.macAddress || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <NetworkInterfaceActions nicName={nicName} nicPresentation={config} vm={vm} />
      </TableData>
    </>
  );
};

export default NetworkInterfaceRow;
