import React, { FC, useState } from 'react';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import AddBootableVolumeBody from '@kubevirt-utils/components/AddBootableVolumeModal/components/AddBootableVolumeBody';
import useAddBootableVolumeModalData from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useAddBootableVolumeModalData';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { isUploadingDisk, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sDelete } from '@multicluster/k8sRequests';
import { ButtonVariant, Content } from '@patternfly/react-core';

import DeleteDataSourceModal from '../../../views/datasources/actions/DeleteDataSourceModal/DeleteDataSourceModal';

import CreatedVolumeConfirmation from './components/CreatedVolumeConfirmation';
import { useAddBootableVolumeFormValidation } from './hooks/useAddBootableVolumeFormValidation';
import {
  DROPDOWN_FORM_SELECTION,
  emptyDataSource,
  SOURCE_DETAILS_SECTION_ID,
} from './utils/constants';
import { createBootableVolume, extractCreatedDataSources, PreferenceOption } from './utils/utils';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  lockedPreference?: PreferenceOption;
  onClose: () => void;
  onCreateVolume?: (createdVolume: BootableVolume) => void;
};

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  lockedPreference,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { bootableVolume, setBootableVolume, setSourceType, sourceType, upload, uploadData } =
    useAddBootableVolumeModalData(lockedPreference);

  const isFormValid = useAddBootableVolumeFormValidation({
    bootableVolume,
    sourceType,
  });

  const [createdVolumes, setCreatedVolumes] = useState<V1beta1DataSource[]>([]);
  const createdVolume = createdVolumes[0];
  const isUploading = isUploadingDisk(upload?.uploadStatus);

  const submitBtnText = (() => {
    if (createdVolume) return t('Close');
    if (isUploading) return t('Uploading');
    return t('Save');
  })();

  const deleteRemainingVolumes = async () => {
    const remaining = createdVolumes.slice(1);
    await Promise.all(
      remaining.map((ds) => kubevirtK8sDelete({ model: DataSourceModel, resource: ds })),
    );
  };

  const openDeleteModal = () => {
    if (isEmpty(createdVolumes)) return;

    createModal(({ isOpen: isDeleteOpen, onClose: onDeleteClose }) => (
      <DeleteDataSourceModal
        onSuccess={async () => {
          await deleteRemainingVolumes().catch(kubevirtConsole.error);
          onClose();
        }}
        dataImportCron={null}
        dataSource={createdVolume}
        isBootableVolume
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />
    ));
  };

  return (
    <TabModal
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(kubevirtConsole.error);
        }
        onClose();
      }}
      onSubmit={(dataSource) => {
        if (createdVolume) {
          return Promise.resolve();
        }

        if (sourceType === DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME) {
          document.getElementById(SOURCE_DETAILS_SECTION_ID)?.scrollIntoView();
        }

        return createBootableVolume({
          bootableVolume,
          onCreateVolume,
          sourceType,
          uploadData,
        })(dataSource).catch((error) => {
          if (isUploadCanceledError(error)) {
            return;
          }
          throw error;
        });
      }}
      onSuccess={(result) => {
        const created = extractCreatedDataSources(result);
        if (!isEmpty(created)) setCreatedVolumes(created);
      }}
      cancelBtnText={createdVolume ? t('Delete volume') : undefined}
      cancelBtnVariant={createdVolume ? ButtonVariant.danger : undefined}
      closeOnSubmit={!!createdVolume}
      headerText={t('Add volume')}
      isDisabled={!createdVolume && !isFormValid}
      isOpen={isOpen}
      obj={emptyDataSource}
      onCancel={createdVolume ? openDeleteModal : undefined}
      submitBtnText={submitBtnText}
    >
      {createdVolume && <CreatedVolumeConfirmation createdVolume={createdVolume} />}
      {!createdVolume && <Content>{t('Add a new bootable volume to the cluster.')}</Content>}
      {!createdVolume && (
        <AddBootableVolumeBody
          bootableVolume={bootableVolume}
          isUploading={isUploading}
          setBootableVolume={setBootableVolume}
          setSourceType={setSourceType}
          sourceType={sourceType}
          upload={upload}
        />
      )}
    </TabModal>
  );
};

export default AddBootableVolumeModal;
