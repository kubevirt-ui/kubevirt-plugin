import { format } from 'date-fns';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

export const generateSnapshotName = (vm: V1VirtualMachine) => {
  const date = new Date();
  const formattedDate = format(date, 'yyyyMMdd-kkmmss');

  return `${getName(vm)}-snapshot-${formattedDate}`;
};
