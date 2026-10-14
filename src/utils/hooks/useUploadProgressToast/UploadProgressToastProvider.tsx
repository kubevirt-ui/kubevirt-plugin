import { type FC, type ReactNode } from 'react';

import ExportUploadToastWatcher from '@kubevirt-utils/components/ExportModal/ExportUploadToastWatcher';

import useUploadBeforeUnload from './UploadNavigationGuard/useUploadBeforeUnload';
import UploadProgressToastListener from './UploadProgressToastListener';
import UploadLinkResourceWatcher from './watch/UploadLinkResourceWatcher';
import WatchedResourcesToastListener from './watchedResources/WatchedResourcesToastListener';

type UploadProgressToastProviderProps = {
  children?: ReactNode;
};

// TODO: check if we can have watcher component per toast feature
const UploadProgressToastProvider: FC<UploadProgressToastProviderProps> = ({ children }) => {
  useUploadBeforeUnload();

  return (
    <>
      <ExportUploadToastWatcher />
      <UploadLinkResourceWatcher />
      <UploadProgressToastListener />
      <WatchedResourcesToastListener />
      {children}
    </>
  );
};

export default UploadProgressToastProvider;
