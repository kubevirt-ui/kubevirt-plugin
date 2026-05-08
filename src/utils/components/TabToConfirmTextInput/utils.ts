import { ReactNode } from 'react';

import { ValidatedOptions } from '@patternfly/react-core';

export const getInputValidated = (errorText: string, hasInteracted: boolean): ValidatedOptions => {
  if (errorText) return ValidatedOptions.error;
  if (hasInteracted) return ValidatedOptions.success;
  return ValidatedOptions.default;
};

export const getHelperTextContent = (
  hasInteracted: boolean,
  errorText: string,
  helperText: ReactNode,
  successHelperText: ReactNode,
): { content: ReactNode; validated: ValidatedOptions } | null => {
  if (errorText) return { content: errorText, validated: ValidatedOptions.error };
  if (hasInteracted && successHelperText)
    return { content: successHelperText, validated: ValidatedOptions.success };
  if (helperText)
    return {
      content: helperText,
      validated: hasInteracted ? ValidatedOptions.success : ValidatedOptions.default,
    };
  return null;
};
