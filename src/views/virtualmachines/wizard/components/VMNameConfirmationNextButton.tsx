import { type FC, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';
import { Button, Tooltip } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  dataTest?: string;
  isSubmitting?: boolean;
  onClick: () => void;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  dataTest = 'wizard-next-button',
  isSubmitting = false,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();
  const { setStrictVMName, strictVMName } = useVMWizardState();
  const { control } = useVMWizard();
  const vmName = useWatch({ control, name: 'deployment.name' });

  const isVMNameValid = isDNS1123Label(vmName);
  const isVMNameAlmostValid = isDNS1123LabelLenient(vmName);
  const isVMNameInvalid = strictVMName ? !isVMNameValid : !isVMNameAlmostValid;
  const isDisabled = isSubmitting || isVMNameInvalid;

  const handleClick = (): void => {
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
    return (
      <Tooltip content={!vmName ? t('VM name is required') : t('VM name is not valid')}>
        {nextButton}
      </Tooltip>
    );
  }

  return nextButton;
};

export default VMNameConfirmationNextButton;
