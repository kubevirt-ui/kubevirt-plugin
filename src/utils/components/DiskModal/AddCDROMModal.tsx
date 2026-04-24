import React, { FC, useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import {
  FORM_FIELD_UPLOAD_FILE,
  UPLOAD_MODE_EMPTY,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';
import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from '@settings/tabs/ClusterTab/components/GeneralSettings/AdvancedCDROMFeatures/hooks/constants';
import { useISOOptions } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useISOOptions';
import { useMountCDROMForm } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useMountCDROMForm';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import CDROMSourceOptions from './components/CDROMSourceOptions/CDROMSourceOptions';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import { useCDROMUploadClose } from './hooks/useCDROMUploadClose';
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
  const { checkUploadReady, upload, uploadData } = useCDIUpload(getCluster(vm));
  const isVMRunning = isRunning(vm);
  const [hyperConvergeConfig] = useHyperConvergeConfiguration();
  const vmNamespace = getNamespace(vm);

  const isDeclarativeHotplugEnabled = Boolean(
    hyperConvergeConfig?.spec?.featureGates?.[DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE],
  );
  const isHotPluggable = isDeclarativeHotplugEnabled;
  const isEmptyDriveAllowed = isDeclarativeHotplugEnabled;
  const { isoOptions } = useISOOptions(vmNamespace);

  const {
    handleClearUpload,
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

  const { handleModalClose, isUploading, markBackgroundUploadStarted } = useCDROMUploadClose(
    upload,
    onClose,
  );

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile) || emptyDriveSelected;
  const isFormValid = Boolean(!hasFormErrors && hasValidSelection);

  const handleModalSubmit = async () => {
    if (uploadEnabled && hasUploadFile) {
      await checkUploadReady();
      markBackgroundUploadStarted();
    }
    return submitCDROM(getValues(), {
      isHotPluggable,
      onSubmit,
      onUploadedDataVolume,
      onUploadStarted,
      selectedISO,
      uploadData,
      uploadEnabled,
      vm,
    });
  };

  const handleISOSelect = (value: string): void => {
    handleISOSelection(value);
    setValue(UPLOAD_FILENAME_FIELD, '');
  };

  const handleClearUploadAndFilename = (): void => {
    handleClearUpload();
    setValue(UPLOAD_FILENAME_FIELD, '');
  };

  const emptyDriveOption = useMemo(
    () => ({
      description: isEmptyDriveAllowed
        ? t('The drive will be attached without media. You can mount an ISO later.')
        : t('Requires enabling advanced CD-ROM features.'),
      isAllowed: isEmptyDriveAllowed,
      isSelected: emptyDriveSelected,
      onSelect: handleEmptyDriveSelection,
    }),
    [isEmptyDriveAllowed, emptyDriveSelected, handleEmptyDriveSelection, t],
  );

  return (
    <FormProvider {...methods}>
      <TabModal
        closeOnSubmit={isFormValid}
        headerText={t('Add CD-ROM')}
        isDisabled={!isFormValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnText={t('Add')}
      >
        <Stack hasGutter>
          {isVMRunning && !isHotPluggable && (
            <StackItem>
              <PendingChangesAlert title={t('Restart required')}>
                {t('To finish adding the CD-ROM drive, restart the virtual machine.')}
              </PendingChangesAlert>
            </StackItem>
          )}
          <StackItem>
            <DiskNameInput isDisabled={isUploading} />
          </StackItem>
          <CDROMSourceOptions
            emptyDriveOption={emptyDriveOption}
            existingISOSelected={existingISOSelected}
            isoOptions={isoOptions}
            isUploading={isUploading}
            onClearUpload={handleClearUploadAndFilename}
            onFileUpload={handleFileUpload}
            onISOSelect={handleISOSelect}
            radioNamePrefix="cdrom-source"
            relevantUpload={isSubmitting ? undefined : upload}
            selectedISO={selectedISO}
            uploadEnabled={uploadEnabled}
          />
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
