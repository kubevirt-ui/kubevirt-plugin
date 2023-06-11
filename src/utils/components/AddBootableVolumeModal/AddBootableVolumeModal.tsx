import React, { FC, useCallback, useMemo, useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-utils/models';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, PopoverPosition, Title } from '@patternfly/react-core';

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
import { createBootableVolume } from './utils/utils';

import './AddBootableVolumeModal.scss';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateVolume?: (source: BootableVolume) => void;
};

const cloneExistingPVC = true; // we want to clone the existing PVC by default, may change in the future versions

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();

  const [preferences] = useK8sWatchResource<V1alpha2VirtualMachineClusterPreference[]>({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
  });

  const preferencesNames = useMemo(() => preferences.map(getName), [preferences]);
  const [formSelection, setFormSelection] = useState<RADIO_FORM_SELECTION>(
    RADIO_FORM_SELECTION.UPLOAD_IMAGE,
  );
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
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      onSubmit={createBootableVolume(
        bootableVolume,
        uploadData,
        isUploadForm,
        cloneExistingPVC,
        onCreateVolume,
      )}
      headerText={t('Add volume')}
      isDisabled={!labels?.[DEFAULT_PREFERENCE_LABEL]}
      isOpen={isOpen}
      obj={emptyDataSource}
      submitBtnText={t('Save')}
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
          isUploadForm={isUploadForm}
          setBootableVolumeField={setBootableVolumeField}
          upload={upload}
        />
        <FormGroup>{/* Spacer */}</FormGroup>
        <Title headingLevel="h5">{t('Destination details')}</Title>
        <VolumeDestination
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
        />
        <FormGroup>{/* Spacer */}</FormGroup>
        <Title headingLevel="h5">
          {t('Volume metadata')}{' '}
          <HelpTextIcon
            bodyContent={t('Set the volume metadata to use the volume as a bootable image.')}
            helpIconClassName="add-bootable-volume-modal__title-help-text-icon"
            position={PopoverPosition.right}
          />
        </Title>
        <VolumeMetadata
          bootableVolume={bootableVolume}
          preferencesNames={preferencesNames}
          setBootableVolumeField={setBootableVolumeField}
        />
      </Form>
    </TabModal>
  );
};

export default AddBootableVolumeModal;
