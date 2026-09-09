import React, { type FC, useEffect, useState } from 'react';

import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { Bullseye } from '@patternfly/react-core';

import { UPLOAD_STATUS, UploadErrorType } from '../utils/consts';
import { getName, getNamespace } from '../utils/selectors';
import { type UploadingStatusProps } from '../utils/types';
import AllocatingStatus from './statuses/AllocatingStatus';
import CancellingStatus from './statuses/CancellingStatus';
import CDIInitErrorStatus from './statuses/CDIInitErrorStatus';
import ErrorStatus from './statuses/ErrorStatus';
import UploadingStatus from './statuses/UploadingStatus';

type UploadPVCFormStatusProps = UploadingStatusProps & {
  allocateError: string;
  isAllocating: boolean;
  isSubmitting: boolean;
  onErrorClick: () => void;
};

const UploadPVCFormStatus: FC<UploadPVCFormStatusProps> = ({
  allocateError,
  dataVolume,
  isAllocating,
  isSubmitting,
  onCancelClick,
  onErrorClick,
  onSuccessClick,
  upload,
}) => {
  const [error, setError] = useState<string>(allocateError ?? upload?.uploadError?.message ?? '');

  useEffect(() => {
    const newError = allocateError ?? upload?.uploadError?.message ?? '';
    setError(newError);
  }, [allocateError, upload]);

  const onCancelFinish = (): void => {
    upload.cancelUpload();
    cancelUploadPVC(upload?.pvcName, upload?.namespace)
      .then(onCancelClick)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  };

  return (
    <Bullseye className={!isSubmitting && 'kv--create-upload__hide'}>
      {error === UploadErrorType.CDI_INIT && (
        <CDIInitErrorStatus
          namespace={getNamespace(dataVolume)}
          onErrorClick={onErrorClick}
          pvcName={getName(dataVolume)}
        />
      )}
      {error && error !== UploadErrorType.CDI_INIT && (
        <ErrorStatus error={error} onErrorClick={onErrorClick} />
      )}
      {isAllocating && <AllocatingStatus />}
      {upload?.uploadStatus === UPLOAD_STATUS.CANCELED && <CancellingStatus />}
      {upload?.uploadStatus !== UPLOAD_STATUS.CANCELED && !isAllocating && (
        <UploadingStatus
          onCancelClick={onCancelFinish}
          onSuccessClick={onSuccessClick}
          upload={upload}
        />
      )}
    </Bullseye>
  );
};

export default UploadPVCFormStatus;
