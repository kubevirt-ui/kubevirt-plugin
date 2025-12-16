import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import EphemeralBadge from '@kubevirt-utils/components/badges/EphemeralBadge/EphemeralBadge';
import PendingBadge from '@kubevirt-utils/components/badges/PendingBadge/PendingBadge';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import { SimpleNICPresentation } from '../../utils/types';
import { getConfigInterfaceState, getRuntimeInterfaceState } from '../../utils/utils';

import NetworkInterfaceActions from './NetworkInterfaceActions';

export type NetworkInterfaceRowProps = {
  obj: SimpleNICPresentation;
};

const NetworkInterfaceRow: FC<
  RowProps<
    SimpleNICPresentation,
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
        {getNetworkNameLabel(t, { network }) || NO_DATA_DASH}
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
