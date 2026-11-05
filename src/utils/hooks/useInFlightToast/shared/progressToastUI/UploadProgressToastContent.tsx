import type { FC } from 'react';

import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import { useInFlightToastStore } from '../../inFlightToastStore';
import { type InFlightProgressToastStoreSlice } from '../../types';
import { type ProgressToastState } from '../types/types';
import { resolveToastUpload } from '../utils/progressToastSync/resolveToastUpload';
import UploadProgressCanceledToast from './UploadProgressCanceledToast';
import UploadProgressErrorToast from './UploadProgressErrorToast';
import UploadProgressSuccessToast from './UploadProgressSuccessToast';
import UploadProgressUploadingToast from './UploadProgressUploadingToast';

type UploadProgressToastContentProps = {
  navigate: (path: string) => void;
  storeSlice: InFlightProgressToastStoreSlice;
  uploadKey: string;
  uploadSnapshot?: ProgressToastState;
};

const UploadProgressToastContent: FC<UploadProgressToastContentProps> = ({
  navigate,
  storeSlice,
  uploadKey,
  uploadSnapshot,
}) => {
  const progressToastState = useInFlightToastStore(
    (state) => state?.[storeSlice].data?.[uploadKey]?.progressToastState,
  );
  const upload = resolveToastUpload(uploadSnapshot, progressToastState);

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
        <UploadProgressUploadingToast
          navigate={navigate}
          storeSlice={storeSlice}
          upload={upload}
          uploadKey={uploadKey}
        />
      );
  }
};

export default UploadProgressToastContent;
