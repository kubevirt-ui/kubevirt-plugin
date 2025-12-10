import { TFunction } from 'react-i18next';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

export const getTooltipContent = (filterType: VirtualMachineRowFilterType, t: TFunction) => {
  if (filterType === VirtualMachineRowFilterType.Cluster) {
    return t(
      'Cluster is already selected. To update filters, choose another project or cluster in the tree view.',
    );
  }
  if (filterType === VirtualMachineRowFilterType.Project) {
    return t(
      'Project is already selected. To update filters, choose another project or cluster in the tree view.',
    );
  }
  return null;
};
