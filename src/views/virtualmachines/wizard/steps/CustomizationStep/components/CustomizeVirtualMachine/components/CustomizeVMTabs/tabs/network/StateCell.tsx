import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import NetworkIcon from '@kubevirt-utils/components/NetworkIcons/NetworkIcon';
import type { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getConfigInterfaceStateFromVM } from '@kubevirt-utils/resources/vm/utils/network/selectors';

type StateCellProps = {
  row: NetworkPresentation;
  vm: V1VirtualMachine;
};

const StateCell: FC<StateCellProps> = ({ row, vm }) => (
  <NetworkIcon configuredState={getConfigInterfaceStateFromVM(vm, row.network?.name)} />
);

export default StateCell;
