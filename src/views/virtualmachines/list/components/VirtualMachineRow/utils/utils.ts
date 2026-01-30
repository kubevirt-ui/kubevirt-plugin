import {
  V1VirtualMachine,
  V1VirtualMachineCondition,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isLiveMigratable } from '@virtualmachines/utils';

const isLiveMigratableCondition = (condition: V1VirtualMachineCondition) =>
  condition?.type === 'LiveMigratable' && condition?.status === 'True';

const isNotLiveMigratableCondition = (condition: V1VirtualMachineCondition) =>
  condition?.type === 'LiveMigratable' && condition?.status === 'False';

const isLiveMigratableType = (condition: V1VirtualMachineCondition) =>
  condition?.type === 'LiveMigratable';

export const filterConditions = (vm: V1VirtualMachine): V1VirtualMachineCondition[] => {
  const isActuallyLiveMigratable = isLiveMigratable(vm);
  const conditions = vm?.status?.conditions;

  const filtered = conditions?.filter(
    (condition) =>
      isLiveMigratableCondition(condition) ||
      (condition?.reason && !isNotLiveMigratableCondition(condition)),
  );

  return filtered?.map((condition) => {
    if (isLiveMigratableType(condition)) {
      return {
        ...condition,
        status: isActuallyLiveMigratable ? 'True' : 'False',
      };
    }
    return condition;
  });
};
