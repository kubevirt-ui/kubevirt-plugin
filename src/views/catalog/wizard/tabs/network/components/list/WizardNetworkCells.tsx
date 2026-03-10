import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getConfigInterfaceStateFromVM } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type NetworkCellProps = {
  row: NetworkPresentation;
};

export const NetworkCell: FC<NetworkCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  return <>{getNetworkNameLabel(t, { network: row.network }) ?? NO_DATA_DASH}</>;
};

type StateCellProps = {
  row: NetworkPresentation;
  vm: V1VirtualMachine;
};

export const StateCell: FC<StateCellProps> = ({ row, vm }) => (
  <NetworkIcon configuredState={getConfigInterfaceStateFromVM(vm, row.network?.name)} />
);
