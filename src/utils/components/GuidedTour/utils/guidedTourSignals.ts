import { signal } from '@preact/signals-react';

import { tourSteps } from './constants';

export const runningTourSignal = signal(false);
export const stepIndexSignal = signal(0);

export const nextStep = () => {
  stepIndexSignal.value++;
};
export const prevStep = () => {
  if (stepIndexSignal.value > 0) {
    --stepIndexSignal.value;
  }
};

export const startTour = () => {
  if (stepIndexSignal.value >= tourSteps.length) stepIndexSignal.value = 0;
  runningTourSignal.value = true;
};

export const stopTour = () => {
  runningTourSignal.value = false;
};

export const resetTour = () => {
  stepIndexSignal.value = 0;
};
