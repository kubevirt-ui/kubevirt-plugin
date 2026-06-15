import React, { FC, ReactNode } from 'react';

import UploadProgressToastListener from './UploadProgressToastListener';

type UploadProgressToastProviderProps = {
  children?: ReactNode;
};

const UploadProgressToastProvider: FC<UploadProgressToastProviderProps> = ({ children }) => (
  <>
    <UploadProgressToastListener />
    {children}
  </>
);

export default UploadProgressToastProvider;
