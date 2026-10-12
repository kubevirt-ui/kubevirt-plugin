import { type HelperOptions } from '@kubevirt-utils/hooks/useKubevirtToast/types';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { signal } from '@preact/signals-core';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

export type WatchedToastData = {
  id: string;
  toastOptions?: HelperOptions;
  watchDataResource: FleetWatchK8sResource | undefined;
};

export const watchedToastSignal = signal<WatchedToastData[]>([]);

const generateWatchedToastId = (): string => `watched-toast-${getRandomChars(8)}`;

export const pushNewWatchedToast = (watchedToastData: Omit<WatchedToastData, 'id'>): void => {
  const id = generateWatchedToastId();
  watchedToastSignal.value = [...watchedToastSignal.value, { id, ...watchedToastData }];
};

export const removeWatchedToast = (id: string): void => {
  watchedToastSignal.value = watchedToastSignal.value.filter((entry) => entry.id !== id);
};

export const getToastsToWatch = (entries: WatchedToastData[]): WatchedToastData[] =>
  entries.filter((entry) => entry.watchDataResource);
