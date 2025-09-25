import React, { FC } from 'react';
import { FormProvider } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import UploadModeSelector from '@kubevirt-utils/components/DiskModal/components/UploadModeSelector/UploadModeSelector';
import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import {
  SELECT_ISO_FIELD_ID,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  convertDataVolumeToTemplate,
  isHotPluggableEnabled,
  mountISOToCDROM,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { uploadDataVolume } from '@kubevirt-utils/components/DiskModal/utils/submit';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  ButtonVariant,
  Content,
  ContentVariants,
  Form,
  FormGroup,
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
  const {
    handleClearUpload,
    handleFileUpload,
    handleISOSelection,
    handleUploadTypeChange,
    isFormValid,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
    uploadType,
  } = useMountCDROMForm();
  const { upload, uploadData } = useCDIUpload();
  const isUploading = isUploadingDisk(upload?.uploadStatus);
  const { featureGates } = useKubevirtHyperconvergeConfiguration();

  const { getValues, setValue } = methods;

  const { isoOptions } = useISOOptions(vmNamespace);

  const handleModalSubmit = async () => {
    const data = getValues();
    const isHotPluggable = isHotPluggableEnabled(featureGates);
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
      const uploadedDataVolume = await uploadDataVolume(vm, uploadData, diskState);

      if (uploadType === VolumeTypes.PERSISTENT_VOLUME_CLAIM) {
        diskState.volume = {
          name: diskState.volume.name,
          persistentVolumeClaim: {
            claimName: getName(uploadedDataVolume),
          },
        };
        delete diskState.dataVolumeTemplate;
      } else {
        diskState.dataVolumeTemplate = convertDataVolumeToTemplate(uploadedDataVolume);
      }
    } else if (selectedISO) {
      delete diskState.dataVolumeTemplate;
    }

    const updatedVM = await mountISOToCDROM(vm, diskState, isHotPluggable);
    return onSubmit(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal<V1VirtualMachine>
        onClose={() => {
          if (upload?.uploadStatus) {
            try {
              upload.cancelUpload();
            } catch (error) {
              kubevirtConsole.error(error);
            }
          }
          onClose();
        }}
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onSubmit={handleModalSubmit}
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form>
          <Stack hasGutter>
            <StackItem>
              <p>
                <Trans t={t}>
                  Mount ISO to <strong>{{ cdromName }}</strong>
                </Trans>
              </p>
            </StackItem>
            <StackItem>
              <FormGroup
                fieldId={SELECT_ISO_FIELD_ID}
                isRequired={uploadMode !== UPLOAD_MODE_UPLOAD}
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
            </StackItem>
            <StackItem>
              <DiskSourceUploadPVC
                handleClearUpload={() => {
                  handleClearUpload();
                  setValue(UPLOAD_FILENAME_FIELD, '');
                }}
                handleUpload={handleFileUpload}
                isRequired={uploadMode !== UPLOAD_MODE_SELECT}
                key={uploadMode}
                label={t('Upload ISO')}
                relevantUpload={upload}
              >
                <Content component={ContentVariants.small}>
                  {t('ISO file must be in the same project as the Virtual Machine')}
                </Content>
                {uploadMode === UPLOAD_MODE_UPLOAD && (
                  <UploadModeSelector
                    isDisabled={isUploading}
                    onUploadModeChange={handleUploadTypeChange}
                    uploadMode={uploadType}
                  />
                )}
              </DiskSourceUploadPVC>
            </StackItem>
          </Stack>
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
