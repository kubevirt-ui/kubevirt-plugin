import React, { FC, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import {
  FORM_FIELD_UPLOAD_FILE,
  isEmptyDriveMode,
  isExistingISOMode,
  isUploadMode,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from '@settings/tabs/ClusterTab/components/GeneralSettings/AdvancedCDROMFeatures/hooks/constants';
import { useISOOptions } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useISOOptions';
import { useMountCDROMForm } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useMountCDROMForm';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import CDROMRestartRequiredAlert from './components/CDROMRestartRequiredAlert/CDROMRestartRequiredAlert';
import CDROMSourceOptions from './components/CDROMSourceOptions/CDROMSourceOptions';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import { getDefaultCreateValues } from './utils/form';
import { submitCDROM } from './utils/submitCDROM';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = ({
  getCurrentVM,
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  onUploadStarted,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { checkUploadReady, uploadData } = useCDIUpload(getCluster(vm));
  const isVMRunning = isRunning(vm);
  const [hyperConvergeConfig] = useHyperConvergeConfiguration(getCluster(vm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const vmNamespace = getNamespace(vm);

  const isDeclarativeHotplugEnabled = Boolean(
    hyperConvergeConfig?.spec?.featureGates?.[DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE],
  );
  const isHotPluggable = isDeclarativeHotplugEnabled;
  const isEmptyDriveAllowed = isDeclarativeHotplugEnabled;
  const { isoOptions } = useISOOptions(vmNamespace);

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.CDROM),
    mode: 'all',
  });

  const {
    clearErrors,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = methods;

  const {
    handleClearUploadAndFilename,
    handleEmptyDriveSelection,
    handleFileUpload,
    handleISOSelect,
    selectedISO,
    uploadMode: mountUploadMode,
  } = useMountCDROMForm({
    clearExtraUploadFilename: () => setValue(UPLOAD_FILENAME_FIELD, ''),
  });

  const uploadEnabled = isUploadMode(mountUploadMode);
  const emptyDriveSelected = isEmptyDriveMode(mountUploadMode);
  const existingISOSelected = isExistingISOMode(mountUploadMode);

  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });
  const hasUploadFile = !isEmpty(uploadFile?.file);
  const hasFormErrors = !isEmpty(errors);

  const closesOnSubmitAfterSave =
    !uploadEnabled || Boolean(selectedISO) || emptyDriveSelected || !hasUploadFile;

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile) || emptyDriveSelected;
  const isFormValid = Boolean(!hasFormErrors && hasValidSelection);

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (uploadEnabled && hasUploadFile) {
        await checkUploadReady();
      }

      const result = await submitCDROM(getValues(), {
        getCurrentVM,
        isHotPluggable,
        onSubmit,
        onUploadedDataVolume,
        onUploadStarted,
        selectedISO,
        t,
        uploadData,
        uploadEnabled,
        vm,
      });

      if (uploadEnabled && hasUploadFile) {
        onClose();
        return;
      }

      return result;
    } finally {
      setIsSubmitting(false);
    }
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
        closeOnSubmit={closesOnSubmitAfterSave}
        headerText={t('Add CD-ROM')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnText={t('Add')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Stack hasGutter>
          <CDROMRestartRequiredAlert
            isHotPluggable={isHotPluggable}
            isVMRunning={isVMRunning}
            variant="add"
          />
          <StackItem>
            <DiskNameInput />
          </StackItem>
          <CDROMSourceOptions
            emptyDriveOption={emptyDriveOption}
            existingISOSelected={existingISOSelected}
            isoOptions={isoOptions}
            isSubmitting={isSubmitting}
            onClearUpload={handleClearUploadAndFilename}
            onFileUpload={handleFileUpload}
            onISOSelect={handleISOSelect}
            radioNamePrefix="cdrom-source"
            selectedISO={selectedISO}
            uploadEnabled={uploadEnabled}
          />
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
