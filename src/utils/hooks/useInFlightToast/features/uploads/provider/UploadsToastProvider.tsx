import { type FC } from 'react';

import UploadProgressToastSliceListener from '@kubevirt-utils/hooks/useInFlightToast/InFlightToastSliceListener';
import UploadLinkResourceWatcher from '@kubevirt-utils/hooks/useInFlightToast/watch/UploadLinkResourceWatcher';

const UploadToastProvider: FC = () => {
  return (
    <>
      <UploadLinkResourceWatcher />
      <UploadProgressToastSliceListener storeSlice="uploads" />
    </>
  );
};

export default UploadToastProvider;
