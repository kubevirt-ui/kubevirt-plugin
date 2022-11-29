import React, { useEffect, useState } from 'react';

import { killUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { Bullseye, EmptyState } from '@patternfly/react-core';

import { UPLOAD_STATUS, uploadErrorType } from '../utils/consts';
import { getName, getNamespace } from '../utils/selectors';
import { UploadingStatusProps } from '../utils/types';

import AllocatingStatus from './statuses/AllocatingStatus';
import CancellingStatus from './statuses/CancellingStatus';
import CDIInitErrorStatus from './statuses/CDIInitErrorStatus';
import ErrorStatus from './statuses/ErrorStatus';
import UploadingStatus from './statuses/UploadingStatus';

type UploadPVCFormStatusProps = UploadingStatusProps & {
  isSubmitting: boolean;
  isAllocating: boolean;
  allocateError: any;
  onErrorClick: () => void;
};

const UploadPVCFormStatus: React.FC<UploadPVCFormStatusProps> = ({
  upload,
  dataVolume,
  isSubmitting,
  isAllocating,
  allocateError,
  onErrorClick,
  onSuccessClick,
  onCancelClick,
}) => {
  const [error, setError] = useState(allocateError || upload?.uploadError?.message);

  useEffect(() => {
    const newError = allocateError || upload?.uploadError?.message;
    setError(newError);
  }, [allocateError, upload]);

  const onCancelFinish = () => {
    upload.cancelUpload();
    killUploadPVC(upload?.pvcName, upload?.namespace)
      .then(onCancelClick)
      .catch((err) => setError(err?.message));
  };

  return (
    <Bullseye className={!isSubmitting && 'kv--create-upload__hide'}>
      <EmptyState>
        {error === uploadErrorType.CDI_INIT && (
          <CDIInitErrorStatus
            onErrorClick={onErrorClick}
            pvcName={getName(dataVolume)}
            namespace={getNamespace(dataVolume)}
          />
        )}
        {error && error !== uploadErrorType.CDI_INIT && (
          <ErrorStatus error={error} onErrorClick={onErrorClick} />
        )}
        {isAllocating && <AllocatingStatus />}
        {upload?.uploadStatus === UPLOAD_STATUS.CANCELED && <CancellingStatus />}
        {upload?.uploadStatus !== UPLOAD_STATUS.CANCELED && !isAllocating && (
          <UploadingStatus
            upload={upload}
            onSuccessClick={onSuccessClick}
            onCancelClick={onCancelFinish}
          />
        )}
      </EmptyState>
    </Bullseye>
  );
};

export default UploadPVCFormStatus;
