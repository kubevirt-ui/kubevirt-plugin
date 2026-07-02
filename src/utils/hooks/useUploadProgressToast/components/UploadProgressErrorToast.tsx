import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FlexItem } from '@patternfly/react-core';

import { UploadEntry } from '../types';

import ToastLayout from './ToastLayout';
import UploadProgressLinks from './UploadProgressLinks';

type UploadProgressErrorToastProps = {
  navigate: (path: string) => void;
  upload: UploadEntry;
};

const UploadProgressErrorToast: FC<UploadProgressErrorToastProps> = ({ navigate, upload }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ToastLayout>
      <FlexItem>{upload.errorMessage ?? t('Upload failed.')}</FlexItem>
      {!isEmpty(upload.contextLinks) && (
        <FlexItem>
          <UploadProgressLinks links={upload.contextLinks} navigate={navigate} />
        </FlexItem>
      )}
    </ToastLayout>
  );
};

export default UploadProgressErrorToast;
