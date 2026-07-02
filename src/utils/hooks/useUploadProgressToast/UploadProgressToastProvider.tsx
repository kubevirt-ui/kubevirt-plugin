import React, { type FC, type ReactNode } from 'react';

import ExportUploadToastWatcher from '@kubevirt-utils/components/ExportModal/ExportUploadToastWatcher';

import useUploadBeforeUnload from './UploadNavigationGuard/useUploadBeforeUnload';
import UploadProgressToastListener from './UploadProgressToastListener';

type UploadProgressToastProviderProps = {
  children?: ReactNode;
};

const UploadProgressToastProvider: FC<UploadProgressToastProviderProps> = ({ children }) => {
  useUploadBeforeUnload();

  return (
    <>
      <ExportUploadToastWatcher />
      <UploadProgressToastListener />
      {children}
    </>
  );
};

export default UploadProgressToastProvider;
