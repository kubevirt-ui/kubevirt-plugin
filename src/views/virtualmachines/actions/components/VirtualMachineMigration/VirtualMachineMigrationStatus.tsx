import { createElement, type FC } from 'react';

import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  type StorageMigrationAPI,
} from '@kubevirt-utils/resources/migrations/constants';

import { getStorageMigrationProgressComponent } from './backends/progressComponentByApi';

type VirtualMachineMigrationStatusProps = {
  cluster?: string;
  onClose: () => void;
  storageMigAPI: StorageMigrationAPI;
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

const VirtualMachineMigrationStatus: FC<VirtualMachineMigrationStatusProps> = (props) => {
  const { storageMigAPI } = props;
  const progressComponent = getStorageMigrationProgressComponent(storageMigAPI);

  if (!progressComponent) {
    return null;
  }

  return createElement(progressComponent, props);
};

export default VirtualMachineMigrationStatus;
