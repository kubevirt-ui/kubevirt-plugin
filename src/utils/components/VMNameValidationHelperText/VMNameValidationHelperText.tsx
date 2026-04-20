import React, { FCC } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ValidatedOptions } from '@patternfly/react-core';

import { getVMNameValidationMessage, validateVMName } from './utils/utils';

type VMNameValidationHelperTextProps = {
  showDefaultHelperText?: boolean;
  touched?: boolean;
  vmName: string;
};

const VMNameValidationHelperText: FCC<VMNameValidationHelperTextProps> = ({
  showDefaultHelperText = false,
  touched = true,
  vmName,
}) => {
  const { t } = useKubevirtTranslation();
  const vmNameValidated = validateVMName(vmName);
  const vmNameValidationMessage = getVMNameValidationMessage(t, vmName, showDefaultHelperText);

  const isEmptyString = !vmName?.trim();
  const shouldSuppressError = !touched && isEmptyString;

  const displayValidated = shouldSuppressError ? ValidatedOptions.default : vmNameValidated;
  const displayMessage = shouldSuppressError ? '' : vmNameValidationMessage;

  return <FormGroupHelperText validated={displayValidated}>{displayMessage}</FormGroupHelperText>;
};

export default VMNameValidationHelperText;
