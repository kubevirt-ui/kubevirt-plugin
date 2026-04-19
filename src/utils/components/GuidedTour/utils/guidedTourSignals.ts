import { signal } from '@preact/signals-react';

export const runningTourSignal = signal(false);
export const stepIndexSignal = signal(0);
export const namespaceSignal = signal<string | undefined>(undefined);
export const tourContextMenuTriggerSignal = signal<HTMLElement | null>(null);
export const welcomeModalDismissedSignal = signal(false);
export const tourStepsSeenSignal = signal<number[]>([]);

export const nextStep = () => {
  stepIndexSignal.value++;
};

export const prevStep = () => {
  if (stepIndexSignal.value > 0) {
    --stepIndexSignal.value;
  }
};
