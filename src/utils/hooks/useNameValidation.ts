import { TFunction } from 'i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import { ValidatedOptions } from '@patternfly/react-core';

type UseNameValidationProps = {
  getError?: (value: string) => ((t: TFunction) => string) | undefined;
  name: string | undefined;
};

type UseNameValidation = (props: UseNameValidationProps) => {
  errorText: string | undefined;
  isValid: boolean;
  validated: ValidatedOptions;
};

export const useNameValidation: UseNameValidation = ({ getError = getDNS1123LabelError, name }) => {
  const { t } = useKubevirtTranslation();

  const error = name !== undefined ? getError(name) : undefined;
  const errorText = error?.(t);
  const validated = errorText ? ValidatedOptions.error : ValidatedOptions.default;
  const isValid = !errorText;

  return { errorText, isValid, validated };
};
