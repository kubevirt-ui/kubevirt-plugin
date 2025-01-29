import { parseSize } from 'xbytes';

import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { columnSortingCompare } from '@kubevirt-utils/utils/utils';

const compareMemory = (
  a: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
  b: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
) => {
  const memoryA = a?.spec?.memory?.guest;
  const memoryB = b?.spec?.memory?.guest;

  const bytesA = parseSize(`${memoryA}B`);
  const bytesB = parseSize(`${memoryB}B`);

  return bytesA - bytesB;
};

export const sortInstanceTypeByMemory = (data, direction, pagination) =>
  columnSortingCompare<
    V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype
  >(data, direction, pagination, compareMemory);
