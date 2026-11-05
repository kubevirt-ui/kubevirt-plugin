import { type FC, type ReactNode } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Tooltip } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

import { getDisabledTooltipText } from './utils/getDisabledTooltipText';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  isDisabled: isExternallyDisabled = false,
  isSubmitting = false,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizardForm();
  const { currentStep } = useVMWizardState();
  const { errors } = useFormState({ control, name: 'deployment.name' });
  const [creationMethod, project, vmName] = useWatch({
    control,
    name: ['creationMethod', 'deployment.project', 'deployment.name'],
  });

  // Clone Deployment details hides the name field until a source VM is selected later.
  const isNameDeferredForClone =
    isCloneCreationMethod(creationMethod) && currentStep === VMWizardStep.DEPLOYMENT_DETAILS;

  const isVmNameValid = isNameDeferredForClone || !errors.deployment?.name;
  // Project and other schema-required fields are gated via isExternallyDisabled (step validation).
  const isDisabled = isExternallyDisabled || isSubmitting || !isVmNameValid;

  const disabledTooltip = getDisabledTooltipText(!isEmpty(project), isVmNameValid, t, vmName);

  const nextButton = (
    <Button
      data-test={dataTest}
      isAriaDisabled={isDisabled}
      isLoading={isSubmitting}
      onClick={isDisabled ? undefined : onClick}
      variant="primary"
    >
      {children}
    </Button>
  );

  if (isDisabled && !isSubmitting) {
    return <Tooltip content={disabledTooltip}>{nextButton}</Tooltip>;
  }

  return nextButton;
};

export default VMNameConfirmationNextButton;
