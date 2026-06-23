import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { UploadEntry } from '../types';

import ToastLayout from './ToastLayout';
import UploadProgressLinks from './UploadProgressLinks';

type UploadProgressSuccessToastProps = {
  navigate: (path: string) => void;
  upload: UploadEntry;
};

const UploadProgressSuccessToast: FC<UploadProgressSuccessToastProps> = ({ navigate, upload }) => {
  const { t } = useKubevirtTranslation();
  const { resourceUrl, successLinks } = upload;
  const links =
    successLinks ?? (resourceUrl ? [{ label: t('View volume'), url: resourceUrl }] : []);

  return (
    <ToastLayout>
      <UploadProgressLinks links={links} navigate={navigate} />
    </ToastLayout>
  );
};

export default UploadProgressSuccessToast;
