import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import { resolveIsVmNameValid } from './utils/resolveIsVmNameValid';

type UseVmNameValidationResult = {
  isVmNameValid: boolean;
  validateVmName: () => Promise<boolean>;
  vmName?: string;
};

const useVmNameValidation = (): UseVmNameValidationResult => {
  const { control, formState, trigger } = useVMWizardForm();
  const { currentStep, setStrictVMName, strictVMName } = useVMWizardState();
  const [creationMethod, vmName] = useWatch({
    control,
    name: ['creationMethod', 'deployment.name'],
  });

  // False only for clone on Deployment details, where the name field is not shown yet.
  const isVmNameRequired = !(
    isCloneCreationMethod(creationMethod) && currentStep === VMWizardStep.DEPLOYMENT_DETAILS
  );

  const isVmNameValid = resolveIsVmNameValid({
    enforceStrictName: strictVMName,
    hasFormNameError: Boolean(formState.errors.deployment?.name),
    isVmNameRequired,
    vmName,
  });

  const validateVmName = useCallback(async (): Promise<boolean> => {
    if (!isVmNameRequired) {
      return true;
    }

    const isValid = await trigger('deployment.name');

    if (!isValid) {
      setStrictVMName(true);
      return false;
    }

    return true;
  }, [isVmNameRequired, setStrictVMName, trigger]);

  return { isVmNameValid, validateVmName, vmName };
};

export default useVmNameValidation;
