import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const NOT_SUPPORTED_VM_ERROR = {
  message: t(
    'VirtualMachine creation is not supported due to incompatible UserDefinedNetwork configuration',
  ),
};
