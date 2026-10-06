import { type TFunction, type TOptions } from 'i18next';

type ValidationMessageType =
  | 'DNS1123_NAME_MESSAGE'
  | 'MAX_NAME_LENGTH_MESSAGE'
  | 'MIN_PASSWORD_LENGTH_MESSAGE'
  | 'SELECT_CLONE_SOURCE_MESSAGE'
  | 'GENERATED_VM_REQUIRED_MESSAGE'
  | 'REQUIRED_LABEL_MESSAGE'
  | 'REQUIRED_LABELS_MESSAGE'
  | 'COMPLETE_INSTANCE_TYPE_MESSAGE'
  | 'SELECT_TEMPLATE_MESSAGE';

export const getValidationMessage = (
  key: ValidationMessageType,
  t: TFunction,
  options?: TOptions,
): string => {
  switch (key) {
    case 'DNS1123_NAME_MESSAGE':
      return t(
        "a lowercase RFC 1123 label must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character",
        options,
      );
    case 'MAX_NAME_LENGTH_MESSAGE':
      return t('Maximum name length is {{ maxNameLength }} characters', options);
    case 'MIN_PASSWORD_LENGTH_MESSAGE':
      return t('Minimum password length is {{ minLength }} characters', options);
    case 'SELECT_CLONE_SOURCE_MESSAGE':
      return t('Select a source virtual machine', options);
    case 'GENERATED_VM_REQUIRED_MESSAGE':
      return t('A generated virtual machine is required', options);
    case 'REQUIRED_LABEL_MESSAGE':
      return t('Required label {{ label }} must have a value', options);
    case 'REQUIRED_LABELS_MESSAGE':
      return t('Required labels {{ labels }} must have values', options);
    case 'COMPLETE_INSTANCE_TYPE_MESSAGE':
      return t('Select a complete instance type', options);
    case 'SELECT_TEMPLATE_MESSAGE':
      return t('Select a template', options);
  }
};
