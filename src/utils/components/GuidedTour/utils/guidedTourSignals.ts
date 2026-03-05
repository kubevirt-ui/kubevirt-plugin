import { signal } from '@preact/signals-react';

export const runningTourSignal = signal(false);
export const stepIndexSignal = signal(0);
export const namespaceSignal = signal<string | undefined>(undefined);

export const nextStep = () => {
  stepIndexSignal.value++;
};

export const prevStep = () => {
  if (stepIndexSignal.value > 0) {
    --stepIndexSignal.value;
  }
};
