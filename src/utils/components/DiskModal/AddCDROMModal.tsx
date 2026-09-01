import React, { type FC } from 'react';
import { FormProvider } from 'react-hook-form';

import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';
import CDROMRestartRequiredAlert from './components/CDROMRestartRequiredAlert/CDROMRestartRequiredAlert';
import CDROMSourceOptions from './components/CDROMSourceOptions/CDROMSourceOptions';
import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import useAddCDROMModalState from './hooks/useAddCDROMModalState';
import { type V1SubDiskModalProps } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const {
    closesOnSubmitAfterSave,
    emptyDriveOption,
    existingISOSelected,
    handleClearUploadAndFilename,
    handleFileUpload,
    handleISOSelect,
    handleModalSubmit,
    isFormValid,
    isHotPluggable,
    isoOptions,
    isSubmitting,
    isVMRunning,
    methods,
    selectedISO,
    t,
    uploadEnabled,
  } = useAddCDROMModalState(props);

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
