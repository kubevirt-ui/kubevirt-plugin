import React, { FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import {
  getVMNameValidationMessage,
  validateVMName,
} from '@kubevirt-utils/components/VMNameValidationHelperText/utils/utils';

type VMNameValidationHelperTextProps = {
  showDefaultHelperText?: boolean;
  vmName: string;
};

const VMNameValidationHelperText: FC<VMNameValidationHelperTextProps> = ({
  showDefaultHelperText = false,
  vmName,
}) => {
  const vmNameValidated = validateVMName(vmName);
  const vmNameValidationMessage = getVMNameValidationMessage(vmName, showDefaultHelperText);

  return (
    <FormGroupHelperText validated={vmNameValidated}>{vmNameValidationMessage}</FormGroupHelperText>
  );
};

export default VMNameValidationHelperText;
