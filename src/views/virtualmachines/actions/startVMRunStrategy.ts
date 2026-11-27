import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { updateRunStrategy } from '@kubevirt-utils/components/RunStrategyModal/utils';
import {
  getDefaultRunningStrategy,
  type RunStrategy,
  RUNSTRATEGY_HALTED,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { getEffectiveRunStrategy } from '@kubevirt-utils/resources/vm/utils/selectors';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

export const getRunStrategyAppliedOnStart = (vm: V1VirtualMachine): RunStrategy | undefined =>
  getEffectiveRunStrategy(vm) === RUNSTRATEGY_HALTED ? getDefaultRunningStrategy() : undefined;

export const applyDefaultRunStrategyToHaltedVM = async (vm: V1VirtualMachine): Promise<boolean> => {
  const runStrategy = getRunStrategyAppliedOnStart(vm);
  if (!runStrategy) {
    return true;
  }

  try {
    await updateRunStrategy(vm, runStrategy);
    return true;
  } catch (error) {
    kubevirtConsole.error(error);
    return false;
  }
};
