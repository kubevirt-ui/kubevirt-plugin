import { type TFunction } from 'i18next';

import {
  type RunStrategy,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/resources/vm/utils/constants';

import { type WarningMessage } from './types';

export const getRunStrategyWarningMessage = (
  t: TFunction,
  runStrategy: RunStrategy,
  initialRunStrategy: RunStrategy | undefined,
  isVMCurrentlyRunning: boolean,
  isMultiple: boolean,
  hasStoppedVMs?: boolean,
): null | WarningMessage => {
  if (initialRunStrategy !== undefined && runStrategy === initialRunStrategy) {
    return null;
  }

  const hasStopped = hasStoppedVMs ?? !isVMCurrentlyRunning;

  if (isVMCurrentlyRunning && runStrategy === RUNSTRATEGY_HALTED) {
    return {
      title: isMultiple
        ? t('This will stop the selected VMs.')
        : t('This will stop the selected VM.'),
    };
  }
  if (runStrategy === RUNSTRATEGY_MANUAL) {
    return {
      body: isMultiple
        ? t(
            'The cluster will no longer automatically restart the selected VMs if they crash. You will be responsible for all start, stop, and restart actions.',
          )
        : t(
            'The cluster will no longer automatically restart this VM if it crashes. You will be responsible for all start, stop, and restart actions.',
          ),
      title: t('Manual run strategy'),
    };
  }
  if (
    hasStopped &&
    (runStrategy === RUNSTRATEGY_ALWAYS || runStrategy === RUNSTRATEGY_RERUNONFAILURE)
  ) {
    return {
      title: isMultiple
        ? t('Stopped VMs will start immediately.')
        : t('The selected VM will start immediately.'),
    };
  }
  return null;
};
