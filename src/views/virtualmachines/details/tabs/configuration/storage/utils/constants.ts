import { TFunction } from 'i18next';

import { UploadAlertStatus } from '@kubevirt-utils/hooks/mountIsoUploadStore';
import { AlertVariant } from '@patternfly/react-core';

export type UploadAlertConfig = { body: string; title: string; variant: AlertVariant };

export const getUploadAlertConfig = (
  t: TFunction,
): Record<UploadAlertStatus, UploadAlertConfig> => ({
  error: {
    body: t('The ISO upload failed. Check the DataVolume status for details.'),
    title: t('Upload failed'),
    variant: AlertVariant.danger,
  },
  success: {
    body: t('The ISO has been uploaded successfully.'),
    title: t('Upload completed'),
    variant: AlertVariant.success,
  },
  uploading: {
    body: t('You can navigate away. The upload will continue in the background.'),
    title: t('Upload in progress'),
    variant: AlertVariant.info,
  },
});
