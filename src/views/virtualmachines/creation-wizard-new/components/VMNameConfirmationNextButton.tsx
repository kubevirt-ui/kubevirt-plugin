import React, { FC, ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';
import { Button, Tooltip } from '@patternfly/react-core';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';

type VMNameConfirmationNextButtonProps = {
  children: ReactNode;
  isSubmitting?: boolean;
  onClick: () => void;
};

const VMNameConfirmationNextButton: FC<VMNameConfirmationNextButtonProps> = ({
  children,
  isSubmitting = false,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizard();
  const vmName = useWatch({ control, name: 'vmData.name' });
  const shouldCheckVMNameProperly = useWatch({
    control,
    name: 'uiState.shouldCheckVMNameProperly',
  });

  const isVMNameValid = isDNS1123Label(vmName);
  const isVMNameAlmostValid = isDNS1123LabelLenient(vmName);
  const isVMNameInvalid = shouldCheckVMNameProperly ? !isVMNameValid : !isVMNameAlmostValid;
  const isDisabled = isSubmitting || isVMNameInvalid;

  const handleClick = () => {
    if (isVMNameValid) {
      onClick();
      return;
    }
    setValue('uiState.shouldCheckVMNameProperly', true);
  };

  const nextButton = (
    <Button
      isAriaDisabled={isDisabled}
      onClick={isDisabled ? undefined : handleClick}
      variant="primary"
    >
      {children}
    </Button>
  );

  if (isDisabled) {
    return (
      <Tooltip content={!vmName ? t('VM name is required') : t('VM name is not valid')}>
        {nextButton}
      </Tooltip>
    );
  }

  return nextButton;
};

export default VMNameConfirmationNextButton;
