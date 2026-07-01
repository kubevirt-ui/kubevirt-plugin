import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FlexItem } from '@patternfly/react-core';

import { UploadEntry } from '../types';

import ToastLayout from './ToastLayout';

type UploadProgressErrorToastProps = {
  upload: UploadEntry;
};

const UploadProgressErrorToast: FC<UploadProgressErrorToastProps> = ({ upload }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ToastLayout>
      <FlexItem>{upload.errorMessage || t('Upload failed.')}</FlexItem>
    </ToastLayout>
  );
};

export default UploadProgressErrorToast;
