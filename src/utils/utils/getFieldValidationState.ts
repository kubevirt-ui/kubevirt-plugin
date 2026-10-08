import type { FieldError } from 'react-hook-form';

import { ValidatedOptions } from '@patternfly/react-core';

type GetFieldValidationState = {
  message: string | undefined;
  validated: ValidatedOptions.error | ValidatedOptions.default;
};

export const getFieldValidationState = (error?: FieldError): GetFieldValidationState => {
  const validated = error ? ValidatedOptions.error : ValidatedOptions.default;
  const message = error?.message;

  return { message: message, validated };
};
