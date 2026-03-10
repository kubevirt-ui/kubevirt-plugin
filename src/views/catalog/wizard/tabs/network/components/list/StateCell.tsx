import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getConfigInterfaceStateFromVM } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type StateCellProps = {
  row: NetworkPresentation;
  vm: V1VirtualMachine;
};

const StateCell: FC<StateCellProps> = ({ row, vm }) => (
  <NetworkIcon configuredState={getConfigInterfaceStateFromVM(vm, row.network?.name)} />
);

export default StateCell;
