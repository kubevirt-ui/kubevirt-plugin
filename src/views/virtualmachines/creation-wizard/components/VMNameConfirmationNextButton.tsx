import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';
import { Button, Tooltip } from '@patternfly/react-core';

import useVMWizardStore from '../state/vm-wizard-store/useVMWizardStore';

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
  const { setShouldCheckVMNameProperly, shouldCheckVMNameProperly, vmName } = useVMWizardStore();
  const isVMNameValid = isDNS1123Label(vmName);
  const isVMNameAlmostValid = isDNS1123LabelLenient(vmName);
  const isVMNameInvalid = shouldCheckVMNameProperly ? !isVMNameValid : !isVMNameAlmostValid;
  const isDisabled = isSubmitting || isVMNameInvalid;
  const handleClick = () => {
    if (isVMNameValid) {
      onClick();
      return;
    }
    setShouldCheckVMNameProperly(true);
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
