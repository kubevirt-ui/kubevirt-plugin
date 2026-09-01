import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getDefaultRunningStrategy,
  type RunStrategy,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getEffectiveRunStrategy,
  getRunStrategy,
  getVMRunning,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

export type { RunStrategyModalProps, RunStrategySelection, WarningMessage } from './types';
export { getRunStrategyWarningMessage } from './warnings';

export const MIXED_HINT_ID = 'run-strategy-mixed-hint';

export const getRunStrategyLabels = (t: TFunction): Record<RunStrategy, string> => ({
  [RUNSTRATEGY_ALWAYS]: t('Always'),
  [RUNSTRATEGY_HALTED]: t('Halted'),
  [RUNSTRATEGY_MANUAL]: t('Manual'),
  [RUNSTRATEGY_RERUNONFAILURE]: t('Rerun on failure'),
});

export const getRunStrategyDescriptions = (t: TFunction): Record<RunStrategy, string> => ({
  [RUNSTRATEGY_ALWAYS]: t(
    'The VM will always be kept running. If there is a failure or a guest-initiated shutdown, it will automatically restart.',
  ),
  [RUNSTRATEGY_HALTED]: t(
    'The VM will be powered off, and all guest OS processes will be stopped.',
  ),
  [RUNSTRATEGY_MANUAL]: t(
    'The VM only runs when you explicitly start it. You control all start, stop, and restart actions.',
  ),
  [RUNSTRATEGY_RERUNONFAILURE]: t(
    'Restarts only if the VM crashes. If you shut down the VM from within the OS, it will remain powered off.',
  ),
});

export const getToggledRunStrategy = (
  checked: boolean,
  currentRunStrategy: RunStrategy | undefined,
  previousRunStrategy: RunStrategy,
): { newStrategy: RunStrategy; savedPrevious: RunStrategy } => {
  if (checked) {
    return { newStrategy: previousRunStrategy, savedPrevious: previousRunStrategy };
  }
  return {
    newStrategy: RUNSTRATEGY_HALTED,
    savedPrevious: currentRunStrategy ?? getDefaultRunningStrategy(),
  };
};

export const getRunStrategyDisplayValue = (t: TFunction, vm: V1VirtualMachine): null | string => {
  const runStrategy = getEffectiveRunStrategy(vm);
  if (!runStrategy) {
    return null;
  }

  const labels = getRunStrategyLabels(t);
  return labels[runStrategy] ?? runStrategy;
};

export const getStartAfterCreationLabel = (t: TFunction): string =>
  t('Start this VirtualMachine after creation');

export const START_AFTER_CREATION_CHECKBOX_ID = 'start-after-create-checkbox';

export const getRunStrategyHelpText = (t: TFunction): string =>
  t('Controls how the VM behaves after a failure, shutdown, or restart.');

export const isRunStrategyStarting = (runStrategy: RunStrategy | undefined): boolean =>
  runStrategy === RUNSTRATEGY_ALWAYS || runStrategy === RUNSTRATEGY_RERUNONFAILURE;

/**
 * Returns a run strategy that will start the VM. Prefers the source strategy
 * if it's already a starting one, otherwise falls back to the default.
 * @param sourceRunStrategy the current effective run strategy
 */
export const getStartingRunStrategy = (sourceRunStrategy: RunStrategy | undefined): RunStrategy =>
  isRunStrategyStarting(sourceRunStrategy) ? sourceRunStrategy : getDefaultRunningStrategy();

/**
 * Migrates the deprecated spec.running boolean to spec.runStrategy.
 * Mutates the VM spec in place — intended for use inside immer produce().
 * Preserves any existing runStrategy; only derives one from the running field
 * when runStrategy is not already set.
 * @param vmSpec the VM spec to migrate
 */
export const migrateRunningFieldToRunStrategy = (vmSpec: V1VirtualMachine['spec']): void => {
  if (vmSpec?.running === undefined) {
    return;
  }

  const wasRunning = vmSpec.running;
  delete vmSpec.running;

  vmSpec.runStrategy ??= wasRunning ? RUNSTRATEGY_ALWAYS : RUNSTRATEGY_HALTED;
};

/**
 * Sets the run strategy on a VM spec, removing the deprecated spec.running field.
 * Mutates in place — intended for use inside immer produce().
 * @param vmSpec the VM spec to update
 * @param runStrategy the run strategy to apply
 */
export const applyRunStrategyToSpec = (
  vmSpec: V1VirtualMachine['spec'],
  runStrategy: RunStrategy,
): void => {
  delete vmSpec.running;
  vmSpec.runStrategy = runStrategy;
};

export const isRunStrategyManual = (runStrategy: RunStrategy | undefined): boolean =>
  runStrategy === RUNSTRATEGY_MANUAL;

export const isRunStrategyNotHalted = (runStrategy: RunStrategy | undefined): boolean =>
  Boolean(runStrategy) && runStrategy !== RUNSTRATEGY_HALTED;

const VALID_RUN_STRATEGIES = new Set<string>([
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
]);

export const isValidRunStrategy = (value: string): value is RunStrategy =>
  VALID_RUN_STRATEGIES.has(value);

/**
 * Builds JSON Patch operations to set spec.runStrategy and remove the deprecated spec.running.
 * @param vm the source VM to derive current field state from
 * @param runStrategy the target run strategy
 */
export const buildRunStrategyPatches = (
  vm: V1VirtualMachine,
  runStrategy: RunStrategy,
): { op: string; path: string; value?: RunStrategy }[] => {
  const ops: { op: string; path: string; value?: RunStrategy }[] = [
    {
      op: getRunStrategy(vm) !== undefined ? 'replace' : 'add',
      path: '/spec/runStrategy',
      value: runStrategy,
    },
  ];

  if (getVMRunning(vm) !== undefined) {
    ops.push({ op: 'remove', path: '/spec/running' });
  }

  return ops;
};

export const updateRunStrategy = (
  vm: V1VirtualMachine,
  runStrategy: RunStrategy,
): Promise<V1VirtualMachine> =>
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: buildRunStrategyPatches(vm, runStrategy),
    model: VirtualMachineModel,
    resource: vm,
  });
