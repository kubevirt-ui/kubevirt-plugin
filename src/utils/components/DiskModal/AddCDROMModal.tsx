import React, { FC, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Checkbox,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSourceUploadPVC from './components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import { getDefaultCreateValues } from './utils/form';
import { addDisk, reorderBootDisk, uploadDataVolume } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload();
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const isVMRunning = isRunning(vm);
  const vmNamespace = getNamespace(vm);

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.CDROM),
    mode: 'all',
  });

  const {
    control,
    formState: { isSubmitting, isValid },
    getValues,
  } = methods;

  const uploadFile = useWatch({ control, name: 'uploadFile' });
  const isFormValid = useMemo(() => {
    const baseValid = isValid && (!uploadEnabled || (uploadEnabled && !isEmpty(uploadFile)));

    if (uploadEnabled && !isEmpty(upload?.uploadStatus) && uploadFile) {
      return baseValid && upload.uploadStatus === UPLOAD_STATUS.SUCCESS;
    }

    return baseValid;
  }, [isValid, uploadEnabled, uploadFile, upload?.uploadStatus]);

  const handleModalSubmit = async () => {
    const data = getValues();

    if (uploadEnabled && data.uploadFile?.file) {
      const uploadedDataVolume = await uploadDataVolume(vm, uploadData, data);
      onUploadedDataVolume?.(uploadedDataVolume);

      data.dataVolumeTemplate.spec.source = {
        pvc: {
          name: getName(uploadedDataVolume),
          namespace: getNamespace(uploadedDataVolume) || vmNamespace,
        },
      };
    } else {
      data.dataVolumeTemplate.spec.source = {
        upload: {},
      };
    }

    const vmWithDisk = addDisk(data, vm);
    const updatedVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, false);

    return onSubmit(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal
        onClose={() => {
          if (upload?.uploadStatus === UPLOAD_STATUS.UPLOADING) {
            try {
              upload.cancelUpload();
            } catch (error) {
              kubevirtConsole.error(error);
            }
          }
          onClose();
        }}
        closeOnSubmit={isFormValid}
        headerText={t('Add CD-ROM')}
        isDisabled={!isFormValid}
        isLoading={isSubmitting}
        isOpen={isOpen}
        onSubmit={handleModalSubmit}
        submitBtnText={t('Add')}
      >
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.p}>{t('Add CD-ROM to the cluster')}</Content>
          </StackItem>
          <StackItem>
            {isVMRunning && (
              <PendingChangesAlert title={t('Adding CD-ROM drive')}>
                {t(
                  'CD-ROM drive will be added to the VirtualMachine when it is stopped and restarted.',
                )}
              </PendingChangesAlert>
            )}
            <Form>
              <DiskNameInput />
              <FormGroup>
                <Checkbox
                  id="upload-iso-checkbox"
                  isChecked={uploadEnabled}
                  label={t('Upload a new ISO file to the cluster')}
                  onChange={(_event, checked) => setUploadEnabled(checked)}
                />
              </FormGroup>
              {uploadEnabled && (
                <>
                  <DiskSourceUploadPVC label={t('Upload ISO')} relevantUpload={upload} />
                  <Content component={ContentVariants.small}>
                    {t('ISO file must be in the same project as the Virtual Machine')}
                  </Content>
                </>
              )}
            </Form>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
