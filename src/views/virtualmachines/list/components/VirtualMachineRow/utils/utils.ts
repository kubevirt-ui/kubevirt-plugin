import { V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

const isLiveMigratableCondition = (condition: V1VirtualMachineCondition) =>
  condition?.type === 'LiveMigratable' && condition?.status === 'True';

const isNotLiveMigratableCondition = (condition: V1VirtualMachineCondition) =>
  condition?.type === 'LiveMigratable' && condition?.status === 'False';

export const filterConditions = (conditions: V1VirtualMachineCondition[]) =>
  conditions?.filter(
    (condition) =>
      isLiveMigratableCondition(condition) ||
      (condition?.reason && !isNotLiveMigratableCondition(condition)),
  );
