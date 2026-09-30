import type { FC } from 'react';
import { useNavigate } from 'react-router';

import AddBootableVolumeBody from '@kubevirt-utils/components/AddBootableVolumeModal/components/AddBootableVolumeBody';
import { handleAddBootableVolumeSuccess } from '@kubevirt-utils/components/AddBootableVolumeModal/components/BootableVolumeModalToasts';
import { emptyDataSource } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { useAddBootableVolumeFormValidation } from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeFormValidation';
import useAddBootableVolumeModalData from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeModalData';
import type { AddBootableVolumeModalProps } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  getAddBootableVolumeSubmitBtnText,
  handleAddBootableVolumeModalClose,
  submitAddBootableVolume,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useCanClonePVCFromNamespace from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content } from '@patternfly/react-core';

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  lockedPreference,
  onClose,
  onCreateVolume,
  onUploadStart,
}) => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const { addInfoToast, addSuccessToast } = useKubevirtToast();
  const {
    bootableVolume,
    checkUploadReady,
    setBootableVolume,
    setSourceType,
    sourceType,
    upload,
    uploadData,
  } = useAddBootableVolumeModalData(lockedPreference);

  const clonePermission = useCanClonePVCFromNamespace(
    bootableVolume?.pvcNamespace,
    bootableVolume?.bootableVolumeNamespace,
    bootableVolume?.bootableVolumeCluster,
  );
  const isFormValid = useAddBootableVolumeFormValidation({
    bootableVolume,
    clonePermission,
    sourceType,
  });

  const isUploading = isUploadingDisk(upload?.uploadStatus);
  const toastHandlers = { addInfoToast, addSuccessToast, navigate, t };

  return (
    <TabModal
      closeOnSubmit
      headerText={t('Add volume')}
      isDisabled={!isFormValid}
      isOpen={isOpen}
      obj={emptyDataSource}
      onClose={() => handleAddBootableVolumeModalClose({ onClose, sourceType, upload })}
      onSubmit={(dataSource) =>
        submitAddBootableVolume({
          bootableVolume,
          checkUploadReady,
          dataSource,
          onClose,
          onCreateVolume,
          onUploadStart,
          sourceType,
          t,
          uploadData,
        })
      }
      onSuccess={(result) => handleAddBootableVolumeSuccess(result, sourceType, toastHandlers)}
      submitBtnText={getAddBootableVolumeSubmitBtnText(t, isUploading)}
    >
      <Content>{t('Add a new bootable volume to the cluster.')}</Content>
      <AddBootableVolumeBody
        bootableVolume={bootableVolume}
        clonePermission={clonePermission}
        isUploading={isUploading}
        setBootableVolume={setBootableVolume}
        setSourceType={setSourceType}
        sourceType={sourceType}
        upload={upload}
      />
    </TabModal>
  );
};

export default AddBootableVolumeModal;
