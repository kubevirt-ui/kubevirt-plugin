import React, { FC, useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import {
  FORM_FIELD_UPLOAD_FILE,
  UPLOAD_MODE_EMPTY,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  isDeclarativeHotplugVolumesEnabled,
  isHotPluggableEnabled,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { FormGroup, Radio, Stack, StackItem } from '@patternfly/react-core';
import { useISOOptions } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useISOOptions';
import { useMountCDROMForm } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useMountCDROMForm';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSourceUploadPVC from './components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import { getDefaultCreateValues } from './utils/form';
import { submitCDROM } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  onUploadStarted,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload();
  const isVMRunning = isRunning(vm);
  const { featureGates } = useKubevirtHyperconvergeConfiguration();
  const vmNamespace = getNamespace(vm);

  const isHotPluggable = isHotPluggableEnabled(featureGates);
  const isEmptyDriveAllowed = isDeclarativeHotplugVolumesEnabled(featureGates);
  const { isoOptions } = useISOOptions(vmNamespace);

  const {
    handleEmptyDriveSelection,
    handleFileUpload,
    handleISOSelection,
    selectedISO,
    uploadMode: mountUploadMode,
  } = useMountCDROMForm();

  const uploadEnabled = mountUploadMode === UPLOAD_MODE_UPLOAD;
  const emptyDriveSelected = mountUploadMode === UPLOAD_MODE_EMPTY;
  const existingISOSelected = mountUploadMode === UPLOAD_MODE_SELECT || mountUploadMode === '';

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
  }, [uploadEnabled, clearErrors]);

  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile) || emptyDriveSelected;
  const isFormValid = Boolean(!hasFormErrors && hasValidSelection);

  const handleModalSubmit = () =>
    submitCDROM(getValues(), {
      isHotPluggable,
      onSubmit,
      onUploadedDataVolume,
      onUploadStarted,
      selectedISO,
      uploadData,
      uploadEnabled,
      vm,
    });

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
          <StackItem>{t('Add a CD-ROM to the VirtualMachine configuration')}</StackItem>
          {isVMRunning && !isHotPluggable && (
            <StackItem>
              <PendingChangesAlert title={t('Adding CD-ROM drive')}>
                {t(
                  'CD-ROM drive will be added to the VirtualMachine when it is stopped and restarted.',
                )}
              </PendingChangesAlert>
            </StackItem>
          )}
          <StackItem>
            <DiskNameInput isDisabled={isUploading} />
          </StackItem>
          <StackItem>
            <FormGroup fieldId="cdrom-source" label={t('CD-ROM source')}>
              <Stack hasGutter>
                <StackItem>
                  <Radio
                    id="cdrom-source-existing"
                    isChecked={existingISOSelected}
                    isDisabled={isUploading}
                    label={t('Mount existing ISO')}
                    name="cdrom-source"
                    onChange={() => handleISOSelection('')}
                  />
                  {existingISOSelected && (
                    <div className="pf-v6-u-ml-lg pf-v6-u-mt-sm">
                      <InlineFilterSelect
                        setSelected={(e) => {
                          handleISOSelection(e);
                          setValue(UPLOAD_FILENAME_FIELD, '');
                        }}
                        toggleProps={{
                          isDisabled: isUploading,
                          isFullWidth: true,
                          placeholder: t('Select ISO file'),
                        }}
                        options={isoOptions}
                        selected={selectedISO}
                      />
                    </div>
                  )}
                </StackItem>
                <StackItem>
                  <Radio
                    id="cdrom-source-upload"
                    isChecked={uploadEnabled}
                    isDisabled={isUploading}
                    label={t('Upload new ISO')}
                    name="cdrom-source"
                    onChange={handleFileUpload}
                  />
                  {uploadEnabled && (
                    <div className="pf-v6-u-ml-lg pf-v6-u-mt-sm">
                      <DiskSourceUploadPVC label="" relevantUpload={upload} />
                    </div>
                  )}
                </StackItem>
                <StackItem>
                  <Radio
                    description={
                      isEmptyDriveAllowed
                        ? t('The drive will be attached without media. You can mount an ISO later.')
                        : t('Requires enabling advanced CD-ROM features.')
                    }
                    id="cdrom-source-empty"
                    isChecked={emptyDriveSelected}
                    isDisabled={isUploading || !isEmptyDriveAllowed}
                    label={t('Leave empty drive')}
                    name="cdrom-source"
                    onChange={handleEmptyDriveSelection}
                  />
                </StackItem>
              </Stack>
            </FormGroup>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
