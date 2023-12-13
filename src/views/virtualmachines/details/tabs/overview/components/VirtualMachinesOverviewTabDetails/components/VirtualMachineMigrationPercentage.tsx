import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useMigrationPercentage from '@kubevirt-utils/resources/vm/hooks/useMigrationPercentage';

type VirtualMachineMigrationPercentageProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationPercentage: FC<VirtualMachineMigrationPercentageProps> = ({ vm }) => {
  const { percentage: migrationPercentage } = useMigrationPercentage(vm);

  return <>{migrationPercentage && ` ( ${migrationPercentage}% completed )`}</>;
};

export default VirtualMachineMigrationPercentage;
