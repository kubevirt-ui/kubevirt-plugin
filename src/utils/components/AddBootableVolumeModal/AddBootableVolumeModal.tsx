import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import AddBootableVolumeBody from '@kubevirt-utils/components/AddBootableVolumeModal/components/AddBootableVolumeBody';
import { handleAddBootableVolumeSuccess } from '@kubevirt-utils/components/AddBootableVolumeModal/components/BootableVolumeModalToasts';
import { emptyDataSource } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { useAddBootableVolumeFormValidation } from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeFormValidation';
import useAddBootableVolumeModalData from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeModalData';
import { AddBootableVolumeModalProps } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import {
  getAddBootableVolumeSubmitBtnText,
  handleAddBootableVolumeModalClose,
  submitAddBootableVolume,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content } from '@patternfly/react-core';

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  lockedPreference,
  onClose,
  onCreateVolume,
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

  const isFormValid = useAddBootableVolumeFormValidation({
    bootableVolume,
    sourceType,
  });

  const isUploading = isUploadingDisk(upload?.uploadStatus);
  const toastHandlers = { addInfoToast, addSuccessToast, navigate, t };

  return (
    <TabModal
      onSubmit={(dataSource) =>
        submitAddBootableVolume({
          bootableVolume,
          checkUploadReady,
          dataSource,
          onClose,
          onCreateVolume,
          sourceType,
          t,
          uploadData,
        })
      }
      closeOnSubmit
      headerText={t('Add volume')}
      isDisabled={!isFormValid}
      isOpen={isOpen}
      obj={emptyDataSource}
      onClose={() => handleAddBootableVolumeModalClose({ onClose, sourceType, upload })}
      onSuccess={(result) => handleAddBootableVolumeSuccess(result, sourceType, toastHandlers)}
      submitBtnText={getAddBootableVolumeSubmitBtnText(t, isUploading)}
    >
      <Content>{t('Add a new bootable volume to the cluster.')}</Content>
      <AddBootableVolumeBody
        bootableVolume={bootableVolume}
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
