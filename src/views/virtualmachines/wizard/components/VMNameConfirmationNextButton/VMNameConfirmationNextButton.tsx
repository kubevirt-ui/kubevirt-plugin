import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Tooltip } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useVmNameValidation from '@virtualmachines/wizard/hooks/useVmNameValidation';

import { getDisabledTooltipText } from './utils/getDisabledTooltipText';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
  validateVmNameOnClick?: boolean;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  isDisabled: isExternallyDisabled = false,
  isSubmitting = false,
  onClick,
  validateVmNameOnClick = true,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizardForm();
  const project = useWatch({ control, name: 'deployment.project' });
  const { isVmNameValid, validateVmName, vmName } = useVmNameValidation();

  // Project and other schema-required fields are gated via isExternallyDisabled (step validation).
  const isDisabled = isExternallyDisabled || isSubmitting || !isVmNameValid;

  const disabledTooltip = getDisabledTooltipText(!isEmpty(project), isVmNameValid, t, vmName);

  const handleClick = async (): Promise<void> => {
    if (validateVmNameOnClick && !(await validateVmName())) {
      return;
    }

    onClick();
  };

  const nextButton = (
    <Button
      data-test={dataTest}
      isAriaDisabled={isDisabled}
      isLoading={isSubmitting}
      onClick={isDisabled ? undefined : handleClick}
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
