import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const interfaceModelType = {
  E1000E: 'e1000e',
  VIRTIO: 'virtio',
};

export const showErrorText = t(
  'No NetworkAttachmentDefinitions available. Contact your system administrator for additional support.',
);
