import React, { FCC } from 'react';

import { InstanceTypeVMStoreActions } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import AddBootableVolumeBody from '@kubevirt-utils/components/AddBootableVolumeModal/components/AddBootableVolumeBody';
import useAddBootableVolumeModalData from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeModalData';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { useAddBootableVolumeFormValidation } from './hooks/useAddBootableVolumeFormValidation';
import { DROPDOWN_FORM_SELECTION, emptyDataSource } from './utils/constants';
import { createBootableVolume } from './utils/utils';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateVolume?: InstanceTypeVMStoreActions['onSelectCreatedVolume'];
};

const AddBootableVolumeModal: FCC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const { bootableVolume, setBootableVolume, setSourceType, sourceType, upload, uploadData } =
    useAddBootableVolumeModalData();

  const isFormValid = useAddBootableVolumeFormValidation({
    bootableVolume,
    sourceType,
  });

  return (
    <TabModal
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(kubevirtConsole.error);
        }
        onClose();
      }}
      onSubmit={(dataSource) => {
        if (sourceType === DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME) {
          document.getElementById('source-details-section').scrollIntoView();
        }

        return createBootableVolume({
          bootableVolume,
          onCreateVolume,
          sourceType,
          uploadData,
        })(dataSource);
      }}
      headerText={t('Add volume')}
      isDisabled={!isFormValid}
      isOpen={isOpen}
      obj={emptyDataSource}
      submitBtnText={t('Save')}
    >
      {t('Add a new bootable volume to the cluster.')}
      <AddBootableVolumeBody
        bootableVolume={bootableVolume}
        setBootableVolume={setBootableVolume}
        setSourceType={setSourceType}
        sourceType={sourceType}
        upload={upload}
      />
    </TabModal>
  );
};

export default AddBootableVolumeModal;
