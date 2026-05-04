import React, { FC, useEffect } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CDROMSourceOptions from '@kubevirt-utils/components/DiskModal/components/CDROMSourceOptions/CDROMSourceOptions';
import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import { useCDROMUploadClose } from '@kubevirt-utils/components/DiskModal/hooks/useCDROMUploadClose';
import {
  FORM_FIELD_UPLOAD_FILE,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  isHotPluggableEnabled,
  mountISOToCDROM,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { uploadDataVolume } from '@kubevirt-utils/components/DiskModal/utils/submit';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { ButtonVariant, Stack } from '@patternfly/react-core';

import { useISOOptions } from './hooks/useISOOptions';
import { useMountCDROMForm } from './hooks/useMountCDROMForm';
import { buildDiskState } from './utils';

type MountCDROMModalProps = {
  cdromName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  onUploadStarted?: (promise: Promise<unknown>) => void;
  vm: V1VirtualMachine;
};

const MountCDROMModal: FC<MountCDROMModalProps> = ({
  cdromName,
  isOpen,
  onClose,
  onSubmit,
  onUploadStarted,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const vmNamespace = getNamespace(vm);
  const { checkUploadReady, upload, uploadData } = useCDIUpload(getCluster(vm));
  const { featureGates } = useKubevirtHyperconvergeConfiguration();
  const isHotPluggable = isHotPluggableEnabled(featureGates);

  const {
    handleClearUpload,
    handleFileUpload,
    handleISOSelection,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
  } = useMountCDROMForm();

  const { clearErrors, control, getValues, setValue } = methods;
  const watchedUploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });

  const uploadEnabled = uploadMode === UPLOAD_MODE_UPLOAD;
  const existingISOSelected = uploadMode === UPLOAD_MODE_SELECT || uploadMode === '';

  const hasUploadFile = !isEmpty(watchedUploadFile?.file);
  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile);
  const isFormValid = Boolean(hasValidSelection);

  const { handleModalClose, isUploading, markBackgroundUploadStarted } = useCDROMUploadClose(
    upload,
    onClose,
  );

  const { isoOptions } = useISOOptions(vmNamespace);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

  const handleISOSelect = (value: string): void => {
    handleISOSelection(value);
    setValue(UPLOAD_FILENAME_FIELD, '');
  };

  const handleClearUploadAndFilename = (): void => {
    handleClearUpload();
    setValue(UPLOAD_FILENAME_FIELD, '');
  };

  const handleModalSubmit = async () => {
    const data = getValues();
    const diskState = buildDiskState(
      uploadMode,
      selectedISO,
      uploadFile?.file,
      vm,
      cdromName,
      uploadFilename,
    );

    if (!diskState) return;

    if (data.uploadFile?.file) {
      await checkUploadReady();
      markBackgroundUploadStarted();

      const uploadPromise = uploadDataVolume(vm, uploadData, diskState);

      const fullPromise = uploadPromise.then(async (uploadedDataVolume) => {
        diskState.volume = {
          dataVolume: { name: getName(uploadedDataVolume) },
          name: diskState.volume.name,
        };
        delete diskState.dataVolumeTemplate;

        const updatedVM = await mountISOToCDROM(vm, diskState, isHotPluggable);
        await onSubmit?.(updatedVM);
      });

      onUploadStarted?.(fullPromise);
      return;
    }

    if (selectedISO) {
      delete diskState.dataVolumeTemplate;
    }

    const updatedVM = await mountISOToCDROM(vm, diskState, isHotPluggable);
    return onSubmit(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal<V1VirtualMachine>
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Stack hasGutter>
          <CDROMSourceOptions
            existingISOSelected={existingISOSelected}
            isoOptions={isoOptions}
            isUploading={isUploading}
            onClearUpload={handleClearUploadAndFilename}
            onFileUpload={handleFileUpload}
            onISOSelect={handleISOSelect}
            radioNamePrefix="mount-source"
            relevantUpload={upload}
            selectedISO={selectedISO}
            uploadEnabled={uploadEnabled}
          />
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
