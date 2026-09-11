import { type FC, useContext, useEffect, useState } from 'react';

import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { CDIUploadContext } from '../utils/context';
import UploadPVCPopoverProgressStatus from './UploadPVCPopoverProgressStatus';
import UploadPVCPopoverUploadStatus from './UploadPVCPopoverUploadStatus';

type PVCUploadStatusProps = {
  pvc: V1beta1PersistentVolumeClaim;
  title?: string;
};

const UploadPVCPopover: FC<PVCUploadStatusProps> = ({ pvc, title }) => {
  const { t } = useKubevirtTranslation();
  const { uploads } = useContext(CDIUploadContext);
  const upload = uploads?.find(
    (upl) => upl?.pvcName === pvc?.metadata?.name && upl?.namespace === pvc?.metadata?.namespace,
  );
  const [error, setError] = useState<{ message: string } | undefined>(upload?.uploadError);

  const onCancelClick = (): void => {
    upload?.cancelUpload?.();
    cancelUploadPVC(pvc?.metadata?.name, pvc?.metadata?.namespace).catch((err: unknown) => {
      setError({ message: err instanceof Error ? err.message : String(err) });
    });
  };

  const onErrorDeleteSource = (): void => {
    cancelUploadPVC(pvc?.metadata?.name, pvc?.metadata?.namespace).catch((err: unknown) => {
      setError({ message: err instanceof Error ? err.message : String(err) });
    });
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
    <UploadPVCPopoverProgressStatus onCancelClick={onCancelClick} title={title ?? t('Uploading')} />
  );
};

export default UploadPVCPopover;
