import React, { FC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { ValidatedOptions } from '@patternfly/react-core';

import { getVMNameValidationMessage, validateVMName } from './utils/utils';

type VMNameValidationHelperTextProps = {
  showDefaultHelperText?: boolean;
  touched?: boolean;
  vmName: string;
};

const VMNameValidationHelperText: FC<VMNameValidationHelperTextProps> = ({
  showDefaultHelperText = false,
  touched = true,
  vmName,
}) => {
  const vmNameValidated = validateVMName(vmName);
  const vmNameValidationMessage = getVMNameValidationMessage(vmName, showDefaultHelperText);

  const isEmptyString = !vmName?.trim();
  const shouldSuppressError = !touched && isEmptyString;

  const displayValidated = shouldSuppressError ? ValidatedOptions.default : vmNameValidated;
  const displayMessage = shouldSuppressError ? '' : vmNameValidationMessage;

  return <FormGroupHelperText validated={displayValidated}>{displayMessage}</FormGroupHelperText>;
};

export default VMNameValidationHelperText;
