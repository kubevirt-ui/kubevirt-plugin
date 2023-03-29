import React, { FC, useCallback, useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup, PopoverPosition, Title } from '@patternfly/react-core';

import { AddBootableVolumeButtonProps } from '../AddBootableVolumeButton/AddBootableVolumeButton';

import FormSelectionRadio from './components/FormSelectionRadio/FormSelectionRadio';
import VolumeDestination from './components/VolumeDestination/VolumeDestination';
import VolumeMetadata from './components/VolumeMetadata/VolumeMetadata';
import VolumeSource from './components/VolumeSource/VolumeSource';
import {
  AddBootableVolumeState,
  emptyDataSource,
  initialBootableVolumeState,
  RADIO_FORM_SELECTION,
} from './utils/constants';
import { createDataSource } from './utils/utils';

import './AddBootableVolumeModal.scss';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
} & Omit<AddBootableVolumeButtonProps, 'loaded'>;

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  preferencesNames,
  onSelectCreatedVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const [formSelection, setFormSelection] = useState<RADIO_FORM_SELECTION>(
    RADIO_FORM_SELECTION.UPLOAD_IMAGE,
  );
  const cloneExistingPVC = true; // we want to clone the existing PVC by default, may change in the future versions
  const { upload, uploadData } = useCDIUpload();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>(
    initialBootableVolumeState,
  );

  const { labels } = bootableVolume || {};

  const isUploadForm = formSelection === RADIO_FORM_SELECTION.UPLOAD_IMAGE;

  const setBootableVolumeField = useCallback(
    (key: string, fieldKey?: string) => (value: string) =>
      setBootableVolume((prevState) => ({
        ...prevState,
        ...(fieldKey
          ? { [key]: { ...prevState[key], [fieldKey]: value } }
          : { ...prevState, [key]: value }),
      })),
    [],
  );

  return (
    <TabModal
      obj={emptyDataSource}
      onSubmit={createDataSource(
        bootableVolume,
        uploadData,
        isUploadForm,
        cloneExistingPVC,
        onSelectCreatedVolume,
      )}
      headerText={t('Add volume')}
      isOpen={isOpen}
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      submitBtnText={t('Save')}
      isDisabled={!labels?.[DEFAULT_PREFERENCE_LABEL]}
    >
      {t('You can upload a new volume or use an existing PersistentVolumeClaim (PVC)')}
      <Form>
        <FormGroup>{/* Spacer */}</FormGroup>
        <FormGroup>
          <FormSelectionRadio formSelection={formSelection} setFormSelection={setFormSelection} />
        </FormGroup>
        <Title headingLevel="h5">{t('Source details')}</Title>
        <VolumeSource
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
          isUploadForm={isUploadForm}
          upload={upload}
        />
        <FormGroup>{/* Spacer */}</FormGroup>
        <Title headingLevel="h5">{t('Destination details')}</Title>
        <VolumeDestination
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
          setBootableVolumeName={setBootableVolumeField('bootableVolumeName')}
        />
        <FormGroup>{/* Spacer */}</FormGroup>
        <Title headingLevel="h5">
          {t('Volume metadata')}{' '}
          <HelpTextIcon
            bodyContent={t('Set the volume metadata to use the volume as a bootable image.')}
            position={PopoverPosition.right}
            helpIconClassName="add-bootable-volume-modal__title-help-text-icon"
          />
        </Title>
        <VolumeMetadata
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
          preferencesNames={preferencesNames}
        />
      </Form>
    </TabModal>
  );
};

export default AddBootableVolumeModal;
