import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';

import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { ValidatedOptions } from '@patternfly/react-core';

export const resolveValidatedOption = (
  override: ValidatedOptions | undefined,
  hasError: boolean,
): ValidatedOptions => override ?? (hasError ? ValidatedOptions.error : ValidatedOptions.default);

type ResolveContainerImageHelperTextArgs = {
  hasImageError: boolean;
  imageHelperText?: ReactNode;
  registrySourceHelperText: string;
  t: TFunction;
};

export const resolveContainerImageHelperText = ({
  hasImageError,
  imageHelperText,
  registrySourceHelperText,
  t,
}: ResolveContainerImageHelperTextArgs): ReactNode =>
  imageHelperText ?? (hasImageError ? getFieldRequiredMessage(t) : registrySourceHelperText);
