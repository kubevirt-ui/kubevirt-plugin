import { type FC, type ReactNode } from 'react';

import ExportDiskProgressProvider from './exportDisk/ExportDiskProgressProvider';
import useUploadBeforeUnload from './UploadNavigationGuard/useUploadBeforeUnload';
import UploadProgressToastSliceListener from './UploadProgressToastSliceListener';
import UploadLinkResourceWatcher from './watch/UploadLinkResourceWatcher';

type UploadProgressToastProviderProps = {
  children?: ReactNode;
};

const UploadProgressToastProvider: FC<UploadProgressToastProviderProps> = ({ children }) => {
  useUploadBeforeUnload();

  return (
    <>
      <ExportDiskProgressProvider />
      <UploadLinkResourceWatcher />
      <UploadProgressToastSliceListener storeSlice="uploads" />
      {children}
    </>
  );
};

export default UploadProgressToastProvider;
