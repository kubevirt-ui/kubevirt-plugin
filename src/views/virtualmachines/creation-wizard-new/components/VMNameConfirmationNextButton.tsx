import React, { FC, ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDNS1123Label, isDNS1123LabelLenient } from '@kubevirt-utils/utils/validation';
import { Button, Tooltip } from '@patternfly/react-core';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '../state/vm-wizard-form/consts';

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
  const vmName = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.NAME });
  const shouldCheckVMNameProperly = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_UI_STATE.SHOULD_CHECK_VM_NAME_PROPERLY,
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
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.SHOULD_CHECK_VM_NAME_PROPERLY, true);
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
