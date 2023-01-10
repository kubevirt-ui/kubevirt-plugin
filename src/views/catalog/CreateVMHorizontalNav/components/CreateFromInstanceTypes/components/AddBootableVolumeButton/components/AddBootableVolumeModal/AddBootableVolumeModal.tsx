import React, { FC, useState } from 'react';
import produce from 'immer';
import xbytes from 'xbytes';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateVMHorizontalNav/components/CreateFromInstanceTypes/utils/constants';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import DiskSourcePVCSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourcePVCSelect';
import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourceUploadPVC';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

import { AddBootableVolumeButtonProps } from '../../AddBootableVolumeButton';

import FilterSelect from './components/FilterSelect/FilterSelect';
import FormSelectionRadio from './components/FormSelectionRadio/FormSelectionRadio';
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

  const [
    {
      bootableVolumeName,
      size,
      annotations,
      labels,
      pvcName,
      pvcNamespace,
      uploadFile,
      uploadFilename,
    },
    setBootableVolume,
  ] = useState<AddBootableVolumeState>(initialBootableVolumeState);

  const isUploadForm = formSelection === RADIO_FORM_SELECTION.UPLOAD_IMAGE;
  const setBootableVolumeField = (key: string, fieldKey?: string) => (value: string) =>
    fieldKey
      ? setBootableVolume((prevState) => ({
          ...prevState,
          [key]: { ...prevState[key], [fieldKey]: value },
        }))
      : setBootableVolume((prevState) => ({ ...prevState, [key]: value }));

  const handleSubmitDataVolume = (emptyBootableVolume: V1beta1DataVolume) => {
    const bootableVolumeToCreate = produce(emptyBootableVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.metadata.annotations = annotations;
      draftBootableVolume.metadata.labels = labels;
      draftBootableVolume.spec.storage.resources.requests.storage = size;

      draftBootableVolume.spec.source = isUploadForm
        ? { upload: {} }
        : { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    return isUploadForm
      ? uploadData({
          file: uploadFile as File,
          dataVolume: bootableVolumeToCreate,
        })
      : k8sCreate({ model: DataVolumeModel, data: bootableVolumeToCreate });
  };

  const handleSubmitDataSource = (dataSource: V1beta1DataSource) => {
    const dataSourceToCreate = produce(dataSource, (draftDataSource) => {
      draftDataSource.metadata.name = bootableVolumeName;
      draftDataSource.metadata.annotations = annotations;
      draftDataSource.metadata.labels = labels;
      draftDataSource.spec.source = { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    return k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });
  };

  return (
    <TabModal
      obj={cloneExistingPVC || isUploadForm ? emptySourceDataVolume : emptyDataSource}
      onSubmit={cloneExistingPVC || isUploadForm ? handleSubmitDataVolume : handleSubmitDataSource}
      headerText={t('Add bootable Volume')}
      isOpen={isOpen}
      onClose={() => {
        if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
          upload.cancelUpload().catch(console.error);
        }
        onClose();
      }}
      submitBtnText={t('Add')}
    >
      <Form>
        <FormGroup>
          <FormSelectionRadio formSelection={formSelection} setFormSelection={setFormSelection} />
        </FormGroup>
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
        {isUploadForm ? (
          <>
            <DiskSourceUploadPVC
              relevantUpload={upload}
              uploadFile={uploadFile}
              uploadFileName={uploadFilename}
              setUploadFile={setBootableVolumeField('uploadFile')}
              setUploadFileName={setBootableVolumeField('uploadFilename')}
            />
            <CapacityInput
              size={size}
              onChange={setBootableVolumeField('size')}
              label={t('Disk size')}
            />
          </>
        ) : (
          <>
            <DiskSourcePVCSelect
              pvcNameSelected={pvcName}
              pvcNamespaceSelected={pvcNamespace}
              selectPVCName={setBootableVolumeField('pvcName')}
              selectPVCNamespace={setBootableVolumeField('pvcNamespace')}
              setDiskSize={(newSize) =>
                setBootableVolumeField('size')(
                  removeByteSuffix(xbytes(Number(newSize), { iec: true, space: false })),
                )
              }
            />
            <Checkbox
              id="clone-pvc-checkbox"
              isChecked={cloneExistingPVC}
              onChange={setCloneExistingPVC}
              label={t('Clone existing PVC')}
            />
          </>
        )}
        <Title headingLevel="h4">{t('Annotations for the bootable Volume')}</Title>
        <FormGroup label={t('Preferences')}>
          <FilterSelect
            selected={labels?.[DEFAULT_PREFERENCE_LABEL]}
            setSelected={setBootableVolumeField('labels', DEFAULT_PREFERENCE_LABEL)}
            options={preferencesNames}
            optionLabelText={t('Preference')}
          />
        </FormGroup>
        <FormGroup label={t('Preferred Instancetype')}>
          <FilterSelect
            selected={labels?.[DEFAULT_INSTANCETYPE_LABEL]}
            setSelected={setBootableVolumeField('labels', DEFAULT_INSTANCETYPE_LABEL)}
            options={instanceTypesNames}
            optionLabelText={t('InstanceType')}
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
