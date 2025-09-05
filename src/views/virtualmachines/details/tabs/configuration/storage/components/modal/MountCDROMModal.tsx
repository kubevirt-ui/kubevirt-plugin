import { FC } from 'react';
import React from 'react';
import { FormProvider } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ISO_FILE_EXTENSION } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { mountISOToCDROM } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { ButtonVariant, FileUpload, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import { updateDisks } from '../../../details/utils/utils';

import { useISOOptions } from './hooks/useISOOptions';
import { useMountCDROMForm } from './hooks/useMountCDROMForm';
import { buildDiskState } from './utils';

const SELECT_ISO_FIELD_ID = 'select-iso';
const UPLOAD_ISO_FIELD_ID = 'upload-iso';
const UPLOAD_ISO_INPUT_ID = 'upload-iso-input';

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
    isFormValid,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
  } = useMountCDROMForm();

  const { isoOptions } = useISOOptions(vmNamespace);

  const handleMount = async () => {
    const diskState = buildDiskState(
      uploadMode,
      selectedISO,
      uploadFile,
      vm,
      cdromName,
      uploadFilename,
    );
    if (!diskState) return;

    const updatedVM = await mountISOToCDROM(vm, diskState);

    if (onSubmit) {
      return onSubmit(updatedVM);
    }
    return updateDisks(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal<V1VirtualMachine>
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleMount}
        shouldWrapInForm
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Stack hasGutter>
          <StackItem>
            <p>{t('Mount ISO to the Virtual Machine')}</p>
          </StackItem>
          <StackItem>
            <FormGroup fieldId={SELECT_ISO_FIELD_ID} isRequired label={t('Select ISO')}>
              <InlineFilterSelect
                toggleProps={{
                  isFullWidth: true,
                  placeholder: t('Select or upload a new ISO file to the cluster'),
                }}
                options={isoOptions}
                selected={selectedISO}
                setSelected={handleISOSelection}
              />
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId={UPLOAD_ISO_FIELD_ID} label={t('Upload ISO')}>
              <FileUpload
                dropzoneProps={{
                  accept: { 'application/*': [ISO_FILE_EXTENSION] },
                }}
                browseButtonText={t('Upload')}
                clearButtonText={t('Clear')}
                filename={uploadFilename}
                filenamePlaceholder={t('Drag and drop a file or upload')}
                id={UPLOAD_ISO_INPUT_ID}
                onClearClick={handleClearUpload}
                onFileInputChange={(_, file: File) => handleFileUpload(file)}
                value={uploadFile}
              />
              <p className="pf-v6-u-mt-sm pf-v6-u-color-200">
                {t('ISO file must be in the same project as the VirtualMachine')}
              </p>
            </FormGroup>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
