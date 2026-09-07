import { signal } from '@preact/signals-react';

const wizardBootableVolumeKeysSignal = signal<string[]>([]);

export const addWizardBootableVolumeUploadKey = (uploadKey: string): void => {
  wizardBootableVolumeKeysSignal.value = [...wizardBootableVolumeKeysSignal.value, uploadKey];
};

export const getWizardBootableVolumeUploadKeys = (): string[] =>
  wizardBootableVolumeKeysSignal.value;

export const clearWizardBootableVolumeUploadKeys = (): void => {
  wizardBootableVolumeKeysSignal.value = [];
};
