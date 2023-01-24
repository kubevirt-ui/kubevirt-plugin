import React, { FC, useState } from 'react';
import produce from 'immer';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import StorageClassSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/StorageClassSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

import { AddBootableVolumeButtonProps } from '../AddBootableVolumeButton/AddBootableVolumeButton';

import FilterSelect from './components/FilterSelect/FilterSelect';
import FormSelectionRadio from './components/FormSelectionRadio/FormSelectionRadio';
import VolumeSource from './components/VolumeSource/VolumeSource';
import {
  AddBootableVolumeState,
  emptyDataSource,
  emptySourceDataVolume,
  initialBootableVolumeState,
  RADIO_FORM_SELECTION,
} from './utils/constants';

type AddBootableVolumeModalProps = {
  isOpen: boolean;
  onClose: () => void;
} & Omit<AddBootableVolumeButtonProps, 'loaded'>;

const AddBootableVolumeModal: FC<AddBootableVolumeModalProps> = ({
  isOpen,
  onClose,
  preferencesNames,
  instanceTypesNames,
}) => {
  const { t } = useKubevirtTranslation();
  const [formSelection, setFormSelection] = useState<RADIO_FORM_SELECTION>(
    RADIO_FORM_SELECTION.UPLOAD_IMAGE,
  );
  const [cloneExistingPVC, setCloneExistingPVC] = useState(true);
  const { upload, uploadData } = useCDIUpload();

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>(
    initialBootableVolumeState,
  );

  const {
    bootableVolumeName,
    size,
    annotations,
    labels,
    pvcName,
    pvcNamespace,
    uploadFile,
    storageClassName,
  } = bootableVolume || {};

  const isUploadForm = formSelection === RADIO_FORM_SELECTION.UPLOAD_IMAGE;

  const setBootableVolumeField = (key: string, fieldKey?: string) => (value: string) =>
    fieldKey
      ? setBootableVolume((prevState) => ({
          ...prevState,
          [key]: { ...prevState[key], [fieldKey]: value },
        }))
      : setBootableVolume((prevState) => ({ ...prevState, [key]: value }));

  const createDataSource = (dataSource: V1beta1DataSource) => {
    const updatedDataSource = produce(dataSource, (draftDataSource) => {
      draftDataSource.metadata.name = bootableVolumeName;
      draftDataSource.metadata.annotations = annotations;
      draftDataSource.metadata.labels = labels;
    });

    if (!cloneExistingPVC && !isUploadForm) {
      const dataSourceToCreate = produce(updatedDataSource, (draftDS) => {
        draftDS.spec.source = { pvc: { name: pvcName, namespace: pvcNamespace } };
      });
      return k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });
    }

    const bootableVolumeToCreate = produce(emptySourceDataVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.spec.storage.resources.requests.storage = size;
      if (storageClassName && isUploadForm) {
        draftBootableVolume.spec.storage.storageClassName = storageClassName;
      }

      draftBootableVolume.spec.source = isUploadForm
        ? { upload: {} }
        : { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    const promise = isUploadForm
      ? uploadData({
          file: uploadFile as File,
          dataVolume: bootableVolumeToCreate,
        })
      : k8sCreate({ model: DataVolumeModel, data: bootableVolumeToCreate });

    const dataSourceToCreate = produce(updatedDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: {
          name: bootableVolumeToCreate.metadata.name,
          namespace: bootableVolumeToCreate.metadata.namespace,
        },
      };
    });

    return promise.then(() => k8sCreate({ model: DataSourceModel, data: dataSourceToCreate }));
  };

  return (
    <TabModal
      obj={emptyDataSource}
      onSubmit={createDataSource}
      headerText={t('Add bootable Volume')}
      isOpen={isOpen}
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      submitBtnText={t('Add')}
      isDisabled={!labels?.[DEFAULT_PREFERENCE_LABEL]}
    >
      <Form>
        <FormGroup>
          <FormSelectionRadio formSelection={formSelection} setFormSelection={setFormSelection} />
        </FormGroup>
        <VolumeSource
          bootableVolume={bootableVolume}
          setBootableVolumeField={setBootableVolumeField}
          cloneExistingPVC={cloneExistingPVC}
          setCloneExistingPVC={setCloneExistingPVC}
          isUploadForm={isUploadForm}
          upload={upload}
        />
        {(cloneExistingPVC || isUploadForm) && (
          <>
            <CapacityInput
              size={size}
              onChange={setBootableVolumeField('size')}
              label={t('Disk size')}
            />
            <StorageClassSelect
              storageClass={storageClassName}
              setStorageClassName={setBootableVolumeField('storageClassName')}
            />
          </>
        )}
        <FormGroup label={t('Name')} isRequired>
          <TextInput
            id="name"
            type="text"
            value={bootableVolumeName}
            onChange={setBootableVolumeField('bootableVolumeName')}
          />
        </FormGroup>
        <FormGroup label={t('Destination project')}>
          <TextInput
            id="destination-project"
            type="text"
            isDisabled
            value={OPENSHIFT_OS_IMAGES_NS}
          />
        </FormGroup>
        <Title headingLevel="h4">{t('Labels for the bootable Volume')}</Title>
        <FormGroup label={t('Default Preference')} isRequired>
          <FilterSelect
            selected={labels?.[DEFAULT_PREFERENCE_LABEL]}
            setSelected={setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)}
            options={preferencesNames}
            groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
            optionLabelText={t('Preference')}
          />
        </FormGroup>
        <FormGroup label={t('Default Instancetype')}>
          <FilterSelect
            selected={labels?.[DEFAULT_INSTANCETYPE_LABEL]}
            setSelected={setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)}
            options={instanceTypesNames}
            groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
            optionLabelText={t('Instancetype')}
          />
        </FormGroup>
        <FormGroup label={t('Description')}>
          <TextInput
            id="description"
            value={annotations?.description}
            onChange={setBootableVolumeField('annotations', ANNOTATIONS.description)}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default AddBootableVolumeModal;
