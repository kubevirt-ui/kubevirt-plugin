import React, { useContext, useEffect, useState } from 'react';

import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { killUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { CDIUploadContext } from '../utils/context';

import UploadPVCPopoverProgressStatus from './UploadPVCPopoverProgressStatus';
import UploadPVCPopoverUploadStatus from './UploadPVCPopoverUploadStatus';

type PVCUploadStatusProps = {
  pvc: V1alpha1PersistentVolumeClaim;
  title?: string;
};

const UploadPVCPopover: React.FC<PVCUploadStatusProps> = ({ pvc, title }) => {
  const { t } = useKubevirtTranslation();
  const { uploads } = useContext(CDIUploadContext);
  const upload = uploads?.find(
    (upl) => upl?.pvcName === pvc?.metadata?.name && upl?.namespace === pvc?.metadata?.namespace,
  );
  const [error, setError] = useState(upload?.uploadError);

  const onCancelClick = () => {
    upload?.cancelUpload?.();
    killUploadPVC(pvc?.metadata?.name, pvc?.metadata?.namespace).catch(setError);
  };

  const onErrorDeleteSource = () => {
    killUploadPVC(pvc?.metadata?.name, pvc?.metadata?.namespace).catch(setError);
  };

  useEffect(() => {
    setError(upload?.uploadError);
  }, [upload]);

  return upload ? (
    <UploadPVCPopoverUploadStatus
      error={error}
      onCancelClick={onCancelClick}
      onErrorDeleteSource={onErrorDeleteSource}
      upload={upload}
    />
  ) : (
    <UploadPVCPopoverProgressStatus onCancelClick={onCancelClick} title={title || t('Uploading')} />
  );
};

export default UploadPVCPopover;
