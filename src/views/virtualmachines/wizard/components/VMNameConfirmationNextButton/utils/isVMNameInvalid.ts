import type { FieldError } from 'react-hook-form';

export const isVMNameInvalid = (
  requireVMName: boolean,
  strictVMName: boolean,
  isVMNameAlmostValid: boolean,
  nameError?: FieldError,
): boolean => {
  if (!requireVMName) {
    return false;
  }

  if (strictVMName) {
    return Boolean(nameError);
  }

  return !isVMNameAlmostValid;
};
