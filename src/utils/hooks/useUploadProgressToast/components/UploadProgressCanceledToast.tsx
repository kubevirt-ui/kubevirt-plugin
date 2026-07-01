import React, { FC } from 'react';

import { ProgressVariant } from '@patternfly/react-core';

import { UploadEntry } from '../types';

import ToastLayout from './ToastLayout';
import UploadProgressBar from './UploadProgressBar';
import UploadProgressLinks from './UploadProgressLinks';

type UploadProgressCanceledToastProps = {
  navigate: (path: string) => void;
  upload: UploadEntry;
};

const UploadProgressCanceledToast: FC<UploadProgressCanceledToastProps> = ({
  navigate,
  upload,
}) => {
  const { contextLinks, fileName, progress } = upload;

  return (
    <ToastLayout>
      <UploadProgressBar
        fileName={fileName}
        progress={progress}
        showSpinner={false}
        variant={ProgressVariant.danger}
      />
      <UploadProgressLinks links={contextLinks} navigate={navigate} />
    </ToastLayout>
  );
};

export default UploadProgressCanceledToast;
