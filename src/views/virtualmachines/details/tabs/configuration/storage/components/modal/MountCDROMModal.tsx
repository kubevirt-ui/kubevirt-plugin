import React, { FC, useEffect } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CDROMRestartRequiredAlert from '@kubevirt-utils/components/DiskModal/components/CDROMRestartRequiredAlert/CDROMRestartRequiredAlert';
import CDROMSourceOptions from '@kubevirt-utils/components/DiskModal/components/CDROMSourceOptions/CDROMSourceOptions';
import { useCDROMUploadClose } from '@kubevirt-utils/components/DiskModal/hooks/useCDROMUploadClose';
import { useCDROMUploadStore } from '@kubevirt-utils/components/DiskModal/hooks/useCDROMUploadStore';
import {
  FORM_FIELD_UPLOAD_FILE,
  isExistingISOMode,
  isUploadMode,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  isHotPluggableEnabled,
  mountISOToCDROM,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { uploadDataVolume } from '@kubevirt-utils/components/DiskModal/utils/submit';
import BackgroundOperationAlert from '@kubevirt-utils/components/TabModal/BackgroundOperationAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { isUploadCanceledError } from '@kubevirt-utils/hooks/useCDIUpload/errors';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeName,
  getPVCClaimName,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import { useISOOptions } from './hooks/useISOOptions';
import { useMountCDROMForm } from './hooks/useMountCDROMForm';
import { buildDiskState, produceMountUploadVolumeState } from './utils';

type MountCDROMModalProps = {
  cdromName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  onUploadStarted?: (promise: Promise<unknown>, cdromDiskName?: string) => void;
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
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));
  const isHotPluggable = isHotPluggableEnabled(featureGates);

  const {
    handleClearUploadAndFilename,
    handleFileUpload,
    handleISOSelect,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
  } = useMountCDROMForm();

  const { clearErrors, control, getValues } = methods;
  const watchedUploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });

  const uploadEnabled = isUploadMode(uploadMode);
  const existingISOSelected = isExistingISOMode(uploadMode);

  const hasUploadFile = !isEmpty(watchedUploadFile?.file);
  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile);
  const isFormValid = Boolean(hasValidSelection);
  const closesOnSubmitAfterSave = Boolean(selectedISO) && !hasUploadFile;

  const { handleModalClose, isUploading, markBackgroundUploadEnded, markBackgroundUploadStarted } =
    useCDROMUploadClose(upload, onClose);

  const { cdromUploadKey, clearCancelUpload, clearPersistedUpload, isUploadActive } =
    useCDROMUploadStore({
      cdromDiskName: cdromName,
      isUploading,
      markBackgroundUploadEnded,
      upload,
      vm,
    });

  const { isoOptions } = useISOOptions(vmNamespace);
  const isVMRunning = isRunning(vm);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

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
      clearPersistedUpload(cdromUploadKey);
      markBackgroundUploadStarted();

      const diskStateForMount = produceMountUploadVolumeState(
        diskState,
        cdromName,
        isHotPluggable,
        isVMRunning,
      );
      const dvName =
        getName(diskState.dataVolumeTemplate) ??
        getDataVolumeName(diskState.volume) ??
        getPVCClaimName(diskState.volume);

      let vmAfterMount: V1VirtualMachine;
      try {
        const vmWithMountedDv = await mountISOToCDROM(vm, diskStateForMount, isHotPluggable);
        const submitResult = await onSubmit?.(vmWithMountedDv);
        vmAfterMount = submitResult ?? vmWithMountedDv;
      } catch (error) {
        markBackgroundUploadEnded();
        throw error;
      }

      const uploadPromise = uploadDataVolume(vmAfterMount, uploadData, diskState, dvName);

      const fullPromise = uploadPromise
        .then(() => {
          onClose();
        })
        .catch((error: unknown) => {
          if (isUploadCanceledError(error)) {
            clearPersistedUpload(cdromUploadKey);
          }
          throw error;
        })
        .finally(() => {
          markBackgroundUploadEnded();
          clearCancelUpload(cdromUploadKey);
        });

      if (onUploadStarted) {
        onUploadStarted(fullPromise, cdromName);
      } else {
        fullPromise.catch(kubevirtConsole.error);
      }
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
        cancelBtnText={isUploadActive ? t('Close') : undefined}
        closeOnSubmit={closesOnSubmitAfterSave && !isUploadActive}
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid || isUploadActive}
        isLoading={isUploadActive}
        isOpen={isOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnText={isUploadActive ? t('Uploading') : t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Stack hasGutter>
          <CDROMRestartRequiredAlert
            isHotPluggable={isHotPluggable}
            isVMRunning={isVMRunning}
            variant="mount"
          />
          {isUploadActive && (
            <StackItem>
              <BackgroundOperationAlert isVisible />
            </StackItem>
          )}
          <CDROMSourceOptions
            existingISOSelected={existingISOSelected}
            isoOptions={isoOptions}
            isUploading={isUploadActive}
            onClearUpload={handleClearUploadAndFilename}
            onFileUpload={handleFileUpload}
            onISOSelect={handleISOSelect}
            radioNamePrefix="mount-source"
            selectedISO={selectedISO}
            uploadEnabled={uploadEnabled}
          />
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
