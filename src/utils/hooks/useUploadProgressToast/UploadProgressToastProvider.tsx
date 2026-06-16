import React, { FC, ReactNode } from 'react';

import useUploadBeforeUnload from './UploadNavigationGuard/useUploadBeforeUnload';
import UploadProgressToastListener from './UploadProgressToastListener';

type UploadProgressToastProviderProps = {
  children?: ReactNode;
};

const UploadProgressToastProvider: FC<UploadProgressToastProviderProps> = ({ children }) => {
  useUploadBeforeUnload();

  return (
    <>
      <UploadProgressToastListener />
      {children}
    </>
  );
};

export default UploadProgressToastProvider;
