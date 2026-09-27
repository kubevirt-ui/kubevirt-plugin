import { useUploadProgressStore } from '../uploadProgressStore';

export const trackWizardPendingUploadKey = (
  uploadKey: string | undefined,
  isWizardCustomizationStep?: boolean,
): void => {
  if (!isWizardCustomizationStep || !uploadKey) {
    return;
  }

  useUploadProgressStore.getState().addWizardPendingUploadKey(uploadKey);
};
