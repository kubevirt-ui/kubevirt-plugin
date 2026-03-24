import { useCallback, useMemo, useState } from 'react';

import { ValidatedOptions } from '@patternfly/react-core';

type UseRequiredFieldValidationResult = {
  isInvalid: boolean;
  onBlur: () => void;
  validated: ValidatedOptions;
};

export const useRequiredFieldValidation = (value: string): UseRequiredFieldValidationResult => {
  const [isTouched, setIsTouched] = useState(false);

  const onBlur = useCallback(() => setIsTouched(true), []);

  const isInvalid = useMemo(() => isTouched && !value?.trim(), [isTouched, value]);

  const validated = isInvalid ? ValidatedOptions.error : ValidatedOptions.default;

  return { isInvalid, onBlur, validated };
};
