import React, { FCC, useEffect } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
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
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  ButtonVariant,
  Content,
  ContentVariants,
  Radio,
  Stack,
  StackItem,
} from '@patternfly/react-core';

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

const MountCDROMModal: FCC<MountCDROMModalProps> = ({
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
  const isUploading = isUploadingDisk(upload?.uploadStatus);
  const hasValidSelection = selectedISO || (uploadEnabled && hasUploadFile);
  const isFormValid = Boolean(hasValidSelection);

  const isBackgroundUploadInProgress = React.useRef(false);

  const { isoOptions } = useISOOptions(vmNamespace);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, clearErrors]);

  const handleModalClose = async () => {
    const shouldCancelUpload =
      isUploading && !isBackgroundUploadInProgress.current && upload?.cancelUpload;

    if (shouldCancelUpload) {
      try {
        await upload.cancelUpload();
      } catch (error) {
        kubevirtConsole.error(error);
      }
    }
    isBackgroundUploadInProgress.current = false;
    onClose();
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
      isBackgroundUploadInProgress.current = true;

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
          <StackItem className="pf-v6-u-mt-md">
            <Content component={ContentVariants.p}>{t('Select mount option')}</Content>
          </StackItem>
          <StackItem>
            <Stack hasGutter>
              <StackItem>
                <Radio
                  id="mount-source-existing"
                  isChecked={existingISOSelected}
                  isDisabled={isUploading}
                  label={t('Use existing ISO')}
                  name="mount-source"
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
                      }}
                      options={isoOptions}
                      placeholder={t('Select ISO file')}
                      selected={selectedISO}
                    />
                  </div>
                )}
              </StackItem>
              <StackItem>
                <Radio
                  id="mount-source-upload"
                  isChecked={uploadEnabled}
                  isDisabled={isUploading}
                  label={t('Upload new ISO')}
                  name="mount-source"
                  onChange={handleFileUpload}
                />
                {uploadEnabled && (
                  <div className="pf-v6-u-ml-lg pf-v6-u-mt-sm">
                    <DiskSourceUploadPVC
                      acceptedFileTypes={{
                        'application/*': ['.iso', '.img', '.qcow2', '.gz', '.xz'],
                      }}
                      handleClearUpload={() => {
                        handleClearUpload();
                        setValue(UPLOAD_FILENAME_FIELD, '');
                      }}
                      handleUpload={handleFileUpload}
                      label=""
                      relevantUpload={upload}
                    />
                  </div>
                )}
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
