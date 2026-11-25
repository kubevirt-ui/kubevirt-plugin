import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { handleAddBootableVolumeSuccess } from '@kubevirt-utils/components/AddBootableVolumeModal/components/BootableVolumeModalToasts';
import { isUploadVolumeSource } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  BootableVolumeWizardStep,
  triggerBootableVolumeWizardStepValidation,
} from '../form/stepValidation';
import type { BootableVolumeWizardFormValues } from '../form/types';
import { createBootableVolumes } from '../utils/createBootableVolumes';
import type { BootableVolumeWizardCallbacks } from '../utils/types';

type UseBootableVolumeWizardSaveArgs = BootableVolumeWizardCallbacks & {
  goToStepById?: (stepId: string) => void;
  onClose: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
};

type UseBootableVolumeWizardSaveResult = {
  error: unknown;
  onSave: () => Promise<void>;
};

const useBootableVolumeWizardSave = ({
  goToStepById,
  onClose,
  onCreateVolume,
  onUploadStart,
  setIsSubmitting,
}: UseBootableVolumeWizardSaveArgs): UseBootableVolumeWizardSaveResult => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { addInfoToast, addSuccessToast } = useKubevirtToast();
  const { cluster, getValues, trigger } = useBootableVolumeWizardForm();
  const { checkUploadReady, uploadData } = useCDIUpload(cluster);
  const [error, setError] = useState<unknown>(null);

  const createFromValues = useCallback(
    async (values: BootableVolumeWizardFormValues): Promise<void> => {
      const sourceType = values.imageSource.sourceType;

      if (isUploadVolumeSource(sourceType)) {
        await checkUploadReady();
        void (async (): Promise<void> => {
          try {
            await createBootableVolumes({
              cluster,
              onCreateVolume,
              onUploadStart,
              t,
              uploadData,
              values,
            });
          } catch (uploadError) {
            if (!isUploadCanceledError(uploadError)) {
              kubevirtConsole.error(uploadError);
            }
          }
        })();
        onClose();
        return;
      }

      const result = await createBootableVolumes({
        cluster,
        onCreateVolume,
        onUploadStart,
        t,
        uploadData,
        values,
      });
      handleAddBootableVolumeSuccess(result, sourceType, {
        addInfoToast,
        addSuccessToast,
        navigate,
        t,
      });
      onClose();
    },
    [
      addInfoToast,
      addSuccessToast,
      checkUploadReady,
      cluster,
      navigate,
      onClose,
      onCreateVolume,
      onUploadStart,
      t,
      uploadData,
    ],
  );

  const onSave = useCallback(async (): Promise<void> => {
    const stepsToValidate = BOOTABLE_VOLUME_WIZARD_STEPS.slice(
      0,
      BOOTABLE_VOLUME_WIZARD_STEPS.indexOf(BootableVolumeWizardStep.REVIEW),
    );
    const stepValidity = await Promise.all(
      stepsToValidate.map(async (step) => ({
        isValid: await triggerBootableVolumeWizardStepValidation(trigger, [step]),
        step,
      })),
    );
    const firstInvalidStep = stepValidity.find(({ isValid }) => !isValid)?.step;

    if (firstInvalidStep) {
      goToStepById?.(firstInvalidStep);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createFromValues(getValues());
    } catch (submitError) {
      if (!isUploadCanceledError(submitError)) {
        setError(submitError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createFromValues, getValues, goToStepById, setIsSubmitting, trigger]);

  return {
    error,
    onSave,
  };
};

export default useBootableVolumeWizardSave;
