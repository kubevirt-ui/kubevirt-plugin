import { TFunction } from 'i18next';

export const getNotSupportedVMError = (t: TFunction) => ({
  message: t(
    'VirtualMachine creation is not supported due to incompatible UserDefinedNetwork configuration',
  ),
});
