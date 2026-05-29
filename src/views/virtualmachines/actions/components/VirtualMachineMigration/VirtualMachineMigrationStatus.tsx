import React, { FC } from 'react';

import {
  type StorageMigrationAPI,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
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
  const Progress = getStorageMigrationProgressComponent(storageMigAPI);

  if (!Progress) {
    return null;
  }

  return <Progress {...props} />;
};

export default VirtualMachineMigrationStatus;
