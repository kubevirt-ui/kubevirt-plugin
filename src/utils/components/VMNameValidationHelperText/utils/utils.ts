import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ValidatedOptions } from '@patternfly/react-core';

export const vmNameLengthExceedsMaxLength = (vmName: string) =>
  vmName?.length > MAX_K8S_NAME_LENGTH;

export const isValidVMName = (vmName: string): boolean => {
  const nameMissing = isEmpty(vmName);
  const nameTooLong = vmNameLengthExceedsMaxLength(vmName);

  return !nameMissing && !nameTooLong;
};

export const validateVMName = (vmName: string): ValidatedOptions =>
  isValidVMName(vmName) ? ValidatedOptions.default : ValidatedOptions.error;

export const getVMNameValidationMessage = (vmName: string, showDefaultMessage: boolean): string => {
  const nameMissing = isEmpty(vmName);
  const nameTooLong = vmNameLengthExceedsMaxLength(vmName);

  if (nameMissing) return t('VirtualMachine name can not be empty.');
  if (nameTooLong)
    return t('Maximum name length is {{ maxNameLength }} characters', {
      maxNameLength: MAX_K8S_NAME_LENGTH,
    });

  return showDefaultMessage ? t('Please provide name to VirtualMachine.') : '';
};
