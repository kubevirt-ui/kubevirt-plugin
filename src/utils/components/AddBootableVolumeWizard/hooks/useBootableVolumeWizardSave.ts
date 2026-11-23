import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { handleAddBootableVolumeSuccess } from '@kubevirt-utils/components/AddBootableVolumeModal/components/BootableVolumeModalToasts';
import { emptyDataSource } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { submitAddBootableVolume } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import {
  BOOTABLE_VOLUME_WIZARD_STEPS,
  BootableVolumeWizardStep,
  triggerBootableVolumeWizardStepValidation,
} from '../form/stepValidation';
import type { BootableVolumeWizardFormValues } from '../form/types';
import { mapWizardFormToBootableVolumeState } from '../utils/mapWizardFormToBootableVolumeState';
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

  const submitBootableVolume = useCallback(
    async (values: BootableVolumeWizardFormValues): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const { bootableVolume, sourceType } = mapWizardFormToBootableVolumeState({
          cluster,
          values,
        });

        const result = await submitAddBootableVolume({
          bootableVolume,
          checkUploadReady,
          dataSource: emptyDataSource,
          onClose,
          onCreateVolume,
          onUploadStart,
          sourceType,
          t,
          uploadData,
        });

        // Upload path calls onClose inside submitAddBootableVolume before returning undefined.
        if (result === undefined) {
          return;
        }

        handleAddBootableVolumeSuccess(result, sourceType, {
          addInfoToast,
          addSuccessToast,
          navigate,
          t,
        });
        onClose();
      } catch (submitError) {
        setError(submitError);
      } finally {
        setIsSubmitting(false);
      }
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
      setIsSubmitting,
      t,
      uploadData,
    ],
  );

  const onSave = useCallback(async (): Promise<void> => {
    // Validate step fields the same way as Next. Avoid formState.isValid, which can stay
    // false with empty errors when using yup.lazy + @hookform/resolvers.
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

    await submitBootableVolume(getValues());
  }, [getValues, goToStepById, submitBootableVolume, trigger]);

  return {
    error,
    onSave,
  };
};

export default useBootableVolumeWizardSave;
