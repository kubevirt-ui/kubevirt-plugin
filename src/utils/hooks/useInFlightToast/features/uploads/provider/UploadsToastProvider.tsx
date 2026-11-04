import { type FC } from 'react';

import { UPLOADS_STORE_SLICE } from '@kubevirt-utils/hooks/useInFlightToast/constants';
import UploadProgressToastSliceListener from '@kubevirt-utils/hooks/useInFlightToast/InFlightToastSliceListener';
import UploadLinkResourceWatcher from '@kubevirt-utils/hooks/useInFlightToast/watch/UploadLinkResourceWatcher';

const UploadToastProvider: FC = () => {
  return (
    <>
      <UploadLinkResourceWatcher />
      <UploadProgressToastSliceListener storeSlice={UPLOADS_STORE_SLICE} />
    </>
  );
};

export default UploadToastProvider;
