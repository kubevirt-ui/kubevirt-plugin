import React, { FC, useEffect, useState } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CDROMRestartRequiredAlert from '@kubevirt-utils/components/DiskModal/components/CDROMRestartRequiredAlert/CDROMRestartRequiredAlert';
import CDROMSourceOptions from '@kubevirt-utils/components/DiskModal/components/CDROMSourceOptions/CDROMSourceOptions';
import {
  FORM_FIELD_UPLOAD_FILE,
  isExistingISOMode,
  isUploadMode,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  createEjectMountedDiskCancelCleanup,
  isHotPluggableEnabled,
  mountISOToCDROM,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import {
  logBackgroundUploadError,
  runVmCdromBackgroundUpload,
} from '@kubevirt-utils/components/DiskModal/utils/vmCdromBackgroundUpload';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVmCdromUploadKeyFromVm } from '@kubevirt-utils/hooks/useUploadProgressToast/utils/uploadKeys';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeName,
  getPVCClaimName,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { ButtonVariant, Stack } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import { useISOOptions } from './hooks/useISOOptions';
import { useMountCDROMForm } from './hooks/useMountCDROMForm';
import { buildDiskState, produceMountUploadVolumeState } from './utils';

type MountCDROMModalProps = {
  cdromName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

const MountCDROMModal: FC<MountCDROMModalProps> = ({
  cdromName,
  isOpen,
  onClose,
  onSubmit,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const vmNamespace = getNamespace(vm);
  const cdromUploadKey = getVmCdromUploadKeyFromVm(vm, cdromName);
  const { checkUploadReady, uploadData } = useCDIUpload(getCluster(vm));
  const { featureGates } = useKubevirtHyperconvergeConfiguration(getCluster(vm));
  const isHotPluggable = isHotPluggableEnabled(featureGates);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { isoOptions } = useISOOptions(vmNamespace);
  const isVMRunning = isRunning(vm);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

  const handleModalSubmit = async () => {
    setIsSubmitting(true);
    try {
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

        const vmWithMountedDv = await mountISOToCDROM(vm, diskStateForMount, isHotPluggable);
        const submitResult = await onSubmit?.(vmWithMountedDv);
        const vmAfterMount = submitResult ?? vmWithMountedDv;

        void runVmCdromBackgroundUpload({
          diskState,
          dvName,
          isHotPluggable,
          onCancelCleanup: createEjectMountedDiskCancelCleanup(vmAfterMount, cdromName),
          t,
          uploadData,
          uploadKey: cdromUploadKey,
          vm: vmAfterMount,
        }).catch(logBackgroundUploadError);

        onClose();
        return;
      }

      if (selectedISO) {
        delete diskState.dataVolumeTemplate;
      }

      const updatedVM = await mountISOToCDROM(vm, diskState, isHotPluggable);
      return onSubmit(updatedVM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <TabModal<V1VirtualMachine>
        closeOnSubmit={closesOnSubmitAfterSave}
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleModalSubmit}
        shouldWrapInForm
        submitBtnVariant={ButtonVariant.primary}
      >
        <Stack hasGutter>
          <CDROMRestartRequiredAlert
            isHotPluggable={isHotPluggable}
            isVMRunning={isVMRunning}
            variant="mount"
          />
          <CDROMSourceOptions
            existingISOSelected={existingISOSelected}
            isoOptions={isoOptions}
            isSubmitting={isSubmitting}
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
