import React, { FC, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import {
  FORM_FIELD_UPLOAD_FILE,
  FORM_FIELD_UPLOAD_MODE,
  SELECT_ISO_FIELD_ID,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  convertDataVolumeToTemplate,
  isHotPluggableEnabled,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useISOOptions } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useISOOptions';
import { useMountCDROMForm } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useMountCDROMForm';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSourceUploadPVC from './components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import UploadModeSelector from './components/UploadModeSelector/UploadModeSelector';
import { getDefaultCreateValues } from './utils/form';
import { addDisk, reorderBootDisk, uploadDataVolume } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps, VolumeTypes } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload();
  const { DATA_VOLUME } = VolumeTypes;
  const isVMRunning = isRunning(vm);
  const { featureGates } = useKubevirtHyperconvergeConfiguration();
  const vmNamespace = getNamespace(vm);

  const isHotPluggable = isHotPluggableEnabled(featureGates);
  const { isoOptions } = useISOOptions(vmNamespace);

  const {
    handleFileUpload,
    handleISOSelection,
    handleUploadTypeChange,
    methods: mountMethods,
    selectedISO,
    uploadMode: mountUploadMode,
    uploadType,
  } = useMountCDROMForm();

  useEffect(() => {
    mountMethods.setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_UPLOAD);
  }, [mountMethods]);

  const uploadEnabled = mountUploadMode === UPLOAD_MODE_UPLOAD;

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.CDROM),
    mode: 'all',
  });

  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = methods;

  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });
  const hasUploadFile = !isEmpty(uploadFile?.file);
  const hasFormErrors = !isEmpty(errors);
  const isUploading = isUploadingDisk(upload?.uploadStatus);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, setValue]);

  const isISORequired = !uploadEnabled;
  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile);
  const hasNoSelection = !selectedISO && !uploadEnabled;
  const isFormValid = Boolean(
    !hasFormErrors && (hasValidSelection || (hasNoSelection && !isISORequired)),
  );

  const handleModalSubmit = async () => {
    const data = getValues();

    if (selectedISO) {
      data.volume = {
        name: data.volume.name,
        persistentVolumeClaim: {
          claimName: selectedISO,
          ...(isHotPluggable && { hotpluggable: true }),
        },
      };
      delete data.dataVolumeTemplate;
    } else if (uploadEnabled && data?.uploadFile?.file) {
      const uploadedDataVolume = await uploadDataVolume(vm, uploadData, data);
      onUploadedDataVolume?.(uploadedDataVolume);

      if (uploadType === DATA_VOLUME) {
        data.dataVolumeTemplate = convertDataVolumeToTemplate(uploadedDataVolume);
        data.volume.dataVolume.name = getName(uploadedDataVolume);

        if (isHotPluggable) {
          data.volume.dataVolume.hotpluggable = true;
        }
      } else {
        data.volume = {
          name: data.volume.name,
          persistentVolumeClaim: {
            claimName: getName(uploadedDataVolume),
            ...(isHotPluggable && { hotpluggable: true }),
          },
        };
        delete data.dataVolumeTemplate;
      }
    } else {
      delete data.dataVolumeTemplate;
      delete data.volume;
    }

    const vmWithDisk = addDisk(data, vm);
    const updatedVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, false);

    return onSubmit(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal
        onClose={async () => {
          if (upload?.uploadStatus) {
            try {
              await upload.cancelUpload();
            } catch (error) {
              kubevirtConsole.error(error);
            }
          }
          onClose();
        }}
        closeOnSubmit={isFormValid}
        headerText={t('Add CD-ROM')}
        isDisabled={!isFormValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnText={t('Add')}
      >
        <Stack hasGutter>
          <StackItem>
            {isVMRunning && (
              <PendingChangesAlert title={t('Adding CD-ROM drive')}>
                {t(
                  'CD-ROM drive will be added to the VirtualMachine when it is stopped and restarted.',
                )}
              </PendingChangesAlert>
            )}
            <div className="pf-v6-c-form">
              <DiskNameInput isDisabled={isUploading} />
              <FormGroup
                fieldId={SELECT_ISO_FIELD_ID}
                isRequired={isISORequired}
                label={t('Select ISO')}
              >
                <InlineFilterSelect
                  setSelected={(e) => {
                    handleISOSelection(e);
                    setValue(UPLOAD_FILENAME_FIELD, '');
                  }}
                  toggleProps={{
                    isDisabled: isUploading,
                    isFullWidth: true,
                    placeholder: t('Select or upload a new ISO file to the cluster'),
                  }}
                  options={isoOptions}
                  selected={selectedISO}
                />
              </FormGroup>
              <FormGroup>
                <Checkbox
                  onChange={(_event, checked) => {
                    checked ? handleFileUpload() : handleISOSelection('');
                  }}
                  id="upload-iso-checkbox"
                  isChecked={uploadEnabled}
                  isDisabled={isUploading}
                  label={t('Upload a new ISO file to the cluster')}
                />
              </FormGroup>
              {uploadEnabled && (
                <>
                  <DiskSourceUploadPVC label={t('Upload ISO')} relevantUpload={upload} />
                  {hasUploadFile && (
                    <UploadModeSelector
                      isDisabled={isUploading}
                      onUploadModeChange={handleUploadTypeChange}
                      uploadMode={uploadType}
                    />
                  )}
                </>
              )}
            </div>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
