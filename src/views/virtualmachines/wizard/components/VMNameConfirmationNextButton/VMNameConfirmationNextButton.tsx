import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Tooltip } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import { vmNameInputSchema } from '../../form/schema/deployment/createDeploymentSchema';
import { useVMWizardForm } from '../../form/VMWizardFormProvider';
import { getDisabledTooltipText } from './utils/getDisabledTooltipText';
import { isVMNameInvalid } from './utils/isVMNameInvalid';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onClick: () => void;
  requireVMName?: boolean;
  validateOnClick?: boolean;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  isDisabled: isExternallyDisabled = false,
  isSubmitting = false,
  onClick,
  requireVMName = true,
  validateOnClick = true,
}) => {
  const { t } = useKubevirtTranslation();
  const { control, formState, trigger } = useVMWizardForm();
  const { setStrictVMName, strictVMName } = useVMWizardState();
  const [vmName, project] = useWatch({
    control,
    name: ['deployment.name', 'deployment.project'],
  });

  const isVMNameAlmostValid = vmNameInputSchema.isValidSync(vmName);

  const vmNameInvalid = isVMNameInvalid(
    requireVMName,
    strictVMName,
    isVMNameAlmostValid,
    formState.errors.deployment?.name,
  );

  // Project and other schema-required fields are gated via isExternallyDisabled (step validation).
  const isDisabled = isExternallyDisabled || isSubmitting || vmNameInvalid;

  const disabledTooltip = getDisabledTooltipText(!isEmpty(project), vmNameInvalid, t, vmName);

  const handleClick = async (): Promise<void> => {
    if (requireVMName && validateOnClick && !(await trigger('deployment.name'))) {
      setStrictVMName(true);
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
