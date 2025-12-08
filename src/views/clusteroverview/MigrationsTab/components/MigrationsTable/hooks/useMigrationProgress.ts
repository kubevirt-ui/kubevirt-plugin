import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useMigrationPercentage from '@kubevirt-utils/resources/vm/hooks/useMigrationPercentage';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { ProgressVariant } from '@patternfly/react-core';
import { getMigrationProgressVariant } from '@virtualmachines/details/tabs/metrics/utils/utils';

type UseMigrationProgress = (
  vmi: V1VirtualMachineInstance,
  migrationPhase: string,
) => {
  percentage: number;
  progressVariant: ProgressVariant;
};

const useMigrationProgress: UseMigrationProgress = (vmi, migrationPhase) => {
  const { isFailed, percentage } = useMigrationPercentage(vmi);

  if (migrationPhase === vmimStatuses.Failed) {
    return {
      percentage: 0,
      progressVariant: ProgressVariant.danger,
    };
  }

  if (migrationPhase === vmimStatuses.Succeeded) {
    return {
      percentage: 100,
      progressVariant: ProgressVariant.success,
    };
  }

  return {
    percentage,
    progressVariant: getMigrationProgressVariant(percentage, isFailed),
  };
};

export default useMigrationProgress;
