import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Tooltip } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import { vmNameInputSchema } from '../form/schema/deployment/createDeploymentSchema';
import { useVMWizardForm } from '../form/VMWizardFormProvider';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
  validateOnClick?: boolean;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  isDisabled: isExternallyDisabled = false,
  isSubmitting = false,
  onClick,
  validateOnClick = true,
}) => {
  const { t } = useKubevirtTranslation();
  const { control, formState, trigger } = useVMWizardForm();
  const { setStrictVMName, strictVMName } = useVMWizardState();
  const vmName = useWatch({
    control,
    name: 'deployment.name',
  });

  const isVMNameAlmostValid = vmNameInputSchema.isValidSync(vmName);

  const isVMNameInvalid = strictVMName
    ? Boolean(formState.errors.deployment?.name)
    : !isVMNameAlmostValid;
  const isDisabled = isExternallyDisabled || isSubmitting || isVMNameInvalid;

  let disabledTooltip = vmName ? t('VM name is not valid') : t('VM name is required');

  if (isExternallyDisabled) {
    disabledTooltip = t('Complete all required fields');
  }

  const handleClick = async (): Promise<void> => {
    const isVMNameValid = !validateOnClick || (await trigger('deployment.name'));
    if (isVMNameValid) {
      onClick();
      return;
    }
    setStrictVMName(true);
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
