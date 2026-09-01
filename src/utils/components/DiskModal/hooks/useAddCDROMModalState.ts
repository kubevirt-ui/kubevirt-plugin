import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import { DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE } from '@settings/tabs/ClusterTab/components/GeneralSettings/AdvancedCDROMFeatures/hooks/constants';
import { useISOOptions } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useISOOptions';
import { useMountCDROMForm } from '@virtualmachines/details/tabs/configuration/storage/components/modal/hooks/useMountCDROMForm';
import { isRunning } from '@virtualmachines/utils';

import { getDefaultCreateValues } from '../utils/form';
import { submitCDROM } from '../utils/submitCDROM';
import { SourceTypes, type V1DiskFormState, type V1SubDiskModalProps } from '../utils/types';
import { type UseAddCDROMModalStateResult } from './types';

const useAddCDROMModalState = (props: V1SubDiskModalProps): UseAddCDROMModalStateResult => {
  const { onClose, onSubmit, onUploadedDataVolume, onUploadStarted, vm } = props;
  const { t } = useKubevirtTranslation();
  const { checkUploadReady, uploadData } = useCDIUpload(getCluster(vm));
  const isVMRunning = isRunning(vm);
  const [hyperConvergeConfig] = useHyperConvergeConfiguration(getCluster(vm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDeclarativeHotplugEnabled = Boolean(
    hyperConvergeConfig?.spec?.featureGates?.[DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE],
  );
  const { isoOptions } = useISOOptions(getNamespace(vm));

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

  const handleModalSubmit = async (): Promise<V1VirtualMachine | void> => {
    setIsSubmitting(true);
    try {
      if (uploadEnabled && hasUploadFile) {
        await checkUploadReady();
      }

      const result = await submitCDROM(getValues(), {
        isHotPluggable: isDeclarativeHotplugEnabled,
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
      description: isDeclarativeHotplugEnabled
        ? t('The drive will be attached without media. You can mount an ISO later.')
        : t('Requires enabling advanced CD-ROM features.'),
      isAllowed: isDeclarativeHotplugEnabled,
      isSelected: emptyDriveSelected,
      onSelect: handleEmptyDriveSelection,
    }),
    [isDeclarativeHotplugEnabled, emptyDriveSelected, handleEmptyDriveSelection, t],
  );

  return {
    closesOnSubmitAfterSave,
    emptyDriveOption,
    existingISOSelected,
    handleClearUploadAndFilename,
    handleFileUpload,
    handleISOSelect,
    handleModalSubmit,
    isFormValid,
    isHotPluggable: isDeclarativeHotplugEnabled,
    isoOptions,
    isSubmitting,
    isVMRunning,
    methods,
    selectedISO,
    t,
    uploadEnabled,
  };
};
export default useAddCDROMModalState;
