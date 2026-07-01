import React, { FC } from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { useUploadProgressStore } from '../uploadProgressStore';

import UploadProgressCanceledToast from './UploadProgressCanceledToast';
import UploadProgressErrorToast from './UploadProgressErrorToast';
import UploadProgressSuccessToast from './UploadProgressSuccessToast';
import UploadProgressUploadingToast from './UploadProgressUploadingToast';

type UploadProgressToastContentProps = {
  navigate: (path: string) => void;
  uploadKey: string;
};

const UploadProgressToastContent: FC<UploadProgressToastContentProps> = ({
  navigate,
  uploadKey,
}) => {
  const upload = useUploadProgressStore((state) => state.uploads[uploadKey]);

  if (!upload) {
    return null;
  }

  switch (upload.status) {
    case UPLOAD_PROGRESS_STATUS.SUCCESS:
      return <UploadProgressSuccessToast navigate={navigate} upload={upload} />;
    case UPLOAD_PROGRESS_STATUS.ERROR:
      return <UploadProgressErrorToast upload={upload} />;
    case UPLOAD_PROGRESS_STATUS.CANCELED:
      return <UploadProgressCanceledToast navigate={navigate} upload={upload} />;
    default:
      return (
        <UploadProgressUploadingToast navigate={navigate} upload={upload} uploadKey={uploadKey} />
      );
  }
};

export default UploadProgressToastContent;
