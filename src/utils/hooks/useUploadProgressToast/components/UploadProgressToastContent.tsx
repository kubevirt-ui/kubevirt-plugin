import type { FC } from 'react';
import React from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import type { UploadEntry } from '../types';
import { useUploadProgressStore } from '../uploadProgressStore';

import UploadProgressCanceledToast from './UploadProgressCanceledToast';
import UploadProgressErrorToast from './UploadProgressErrorToast';
import UploadProgressSuccessToast from './UploadProgressSuccessToast';
import UploadProgressUploadingToast from './UploadProgressUploadingToast';

type UploadProgressToastContentProps = {
  navigate: (path: string) => void;
  uploadKey: string;
  uploadSnapshot?: UploadEntry;
};

const UploadProgressToastContent: FC<UploadProgressToastContentProps> = ({
  navigate,
  uploadKey,
  uploadSnapshot,
}) => {
  const storeUpload = useUploadProgressStore((state) =>
    uploadSnapshot ? undefined : state.uploads[uploadKey],
  );
  const upload = uploadSnapshot ?? storeUpload;

  if (!upload) {
    return null;
  }

  switch (upload.status) {
    case UPLOAD_PROGRESS_STATUS.SUCCESS:
      return <UploadProgressSuccessToast navigate={navigate} upload={upload} />;
    case UPLOAD_PROGRESS_STATUS.ERROR:
      return <UploadProgressErrorToast navigate={navigate} upload={upload} />;
    case UPLOAD_PROGRESS_STATUS.CANCELED:
      return <UploadProgressCanceledToast navigate={navigate} upload={upload} />;
    default:
      return (
        <UploadProgressUploadingToast navigate={navigate} upload={upload} uploadKey={uploadKey} />
      );
  }
};

export default UploadProgressToastContent;
