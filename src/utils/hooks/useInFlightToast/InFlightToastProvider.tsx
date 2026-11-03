import { type FC, type ReactNode } from 'react';

import ExportDiskProgressProvider from './features/exportDisk/ExportDiskProgressProvider';
import UploadToastProvider from './features/uploads/provider/UploadsToastProvider';
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
      {children}
    </>
  );
};

export default InFlightToastProvider;
