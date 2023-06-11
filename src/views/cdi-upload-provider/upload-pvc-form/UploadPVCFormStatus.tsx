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
  allocateError: any;
  isAllocating: boolean;
  isSubmitting: boolean;
  onErrorClick: () => void;
};

const UploadPVCFormStatus: React.FC<UploadPVCFormStatusProps> = ({
  allocateError,
  dataVolume,
  isAllocating,
  isSubmitting,
  onCancelClick,
  onErrorClick,
  onSuccessClick,
  upload,
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
            namespace={getNamespace(dataVolume)}
            onErrorClick={onErrorClick}
            pvcName={getName(dataVolume)}
          />
        )}
        {error && error !== uploadErrorType.CDI_INIT && (
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
      </EmptyState>
    </Bullseye>
  );
};

export default UploadPVCFormStatus;
