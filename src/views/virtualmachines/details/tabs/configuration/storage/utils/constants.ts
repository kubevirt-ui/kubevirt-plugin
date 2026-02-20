import { AlertVariant } from '@patternfly/react-core';

export type UploadAlertStatus = 'error' | 'success' | 'uploading';

export const uploadAlertConfig: Record<
  UploadAlertStatus,
  { body: string; title: string; variant: AlertVariant }
> = {
  error: {
    body: 'The ISO upload failed. Check the DataVolume status for details.',
    title: 'Upload failed',
    variant: AlertVariant.danger,
  },
  success: {
    body: 'The ISO has been uploaded successfully.',
    title: 'Upload completed',
    variant: AlertVariant.success,
  },
  uploading: {
    body: 'You may leave this screen while the upload completes in the background.',
    title: 'Upload in progress',
    variant: AlertVariant.info,
  },
};
