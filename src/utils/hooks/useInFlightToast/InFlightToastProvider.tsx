import { type FC, type ReactNode } from 'react';

import ExportDiskProgressProvider from './features/exportDisk/provider/ExportDiskProgressProvider';
import UploadToastProvider from './features/uploads/provider/UploadsToastProvider';
import WatchedResourcesToastProvider from './features/watchedResources/provider/WatchedResourcesToastProvider';
import useUploadBeforeUnload from './UploadNavigationGuard/useUploadBeforeUnload';

type InFlightToastProviderProps = {
  children?: ReactNode;
};

const InFlightToastProvider: FC<InFlightToastProviderProps> = ({ children }) => {
  useUploadBeforeUnload();

  return (
    <>
      <ExportDiskProgressProvider />
      <UploadToastProvider />
      <WatchedResourcesToastProvider />
      {children}
    </>
  );
};

export default InFlightToastProvider;
