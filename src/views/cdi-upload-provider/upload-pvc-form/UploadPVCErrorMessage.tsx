import type { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { UploadErrorType } from '../utils/consts';

type UploadErrorMessageProps = {
  message: string;
  uploadProxyURL?: string;
};

const UploadPVCErrorMessage: FC<UploadErrorMessageProps> = ({ message, uploadProxyURL }) => {
  const { t } = useKubevirtTranslation();

  const Error = {
    [UploadErrorType.ALLOCATE]: t('Could not create persistent volume claim'),
    [UploadErrorType.CERT]: (
      <>
        {t('It seems that your browser does not trust the certificate of the upload proxy.')}
        {uploadProxyURL && (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            Please{' '}
            <a href={`https://${uploadProxyURL}`} rel="noopener noreferrer" target="_blank">
              approve this certificate
            </a>{' '}
            and try again
          </Trans>
        )}
      </>
    ),
    [UploadErrorType.MISSING]: t('File input is missing'),
  };
  return (
    <Alert
      className="co-alert--scrollable"
      isInline
      title={t('An error occurred')}
      variant={AlertVariant.danger}
    >
      <div className="co-pre-line">{Error?.[message] || message}</div>
    </Alert>
  );
};

export default UploadPVCErrorMessage;
