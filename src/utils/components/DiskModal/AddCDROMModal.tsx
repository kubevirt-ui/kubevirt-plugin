import React, { FC, useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { FORM_FIELD_UPLOAD_FILE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { isHotPluggableEnabled } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { PendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/PendingChangesAlert/PendingChangesAlert';
import { useCDIUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtHyperconvergeConfiguration from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration.ts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import TabModal from '../TabModal/TabModal';

import DiskNameInput from './components/DiskNameInput/DiskNameInput';
import DiskSourceUploadPVC from './components/DiskSourceSelect/components/DiskSourceUploadPVC/DiskSourceUploadPVC';
import UploadModeSelector from './components/UploadModeSelector/UploadModeSelector';
import { getDefaultCreateValues } from './utils/form';
import { addDisk, reorderBootDisk, uploadDataVolume } from './utils/submit';
import { SourceTypes, V1DiskFormState, V1SubDiskModalProps, VolumeTypes } from './utils/types';

const AddCDROMModal: FC<V1SubDiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUploadedDataVolume,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { upload, uploadData } = useCDIUpload();
  const { DATA_VOLUME } = VolumeTypes;
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [uploadMode, setUploadMode] = useState<
    VolumeTypes.DATA_VOLUME | VolumeTypes.PERSISTENT_VOLUME_CLAIM
  >(DATA_VOLUME);
  const isVMRunning = isRunning(vm);
  const { featureGates } = useKubevirtHyperconvergeConfiguration();

  const isHotPluggable = isHotPluggableEnabled(featureGates);

  const methods = useForm<V1DiskFormState>({
    defaultValues: getDefaultCreateValues(vm, SourceTypes.CDROM),
    mode: 'all',
  });

  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = methods;

  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });
  const hasUploadFile = !isEmpty(uploadFile?.file);
  const hasFormErrors = !isEmpty(errors);
  const isUploading = isUploadingDisk(upload?.uploadStatus);

  useEffect(() => {
    if (!uploadEnabled) {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
    }
  }, [uploadEnabled, setValue]);

  const isFormValid = !hasFormErrors && (!uploadEnabled || hasUploadFile);

  const handleModalSubmit = async () => {
    const data = getValues();

    if (uploadEnabled && data.uploadFile?.file) {
      const uploadedDataVolume = await uploadDataVolume(vm, uploadData, data);
      onUploadedDataVolume?.(uploadedDataVolume);

      if (uploadMode === DATA_VOLUME) {
        data.dataVolumeTemplate.spec.source = {
          pvc: {
            name: getName(uploadedDataVolume),
            namespace: getNamespace(uploadedDataVolume) || getNamespace(vm),
          },
        };
        if (isHotPluggable) {
          data.volume.dataVolume.hotpluggable = true;
        }
      } else {
        data.volume = {
          name: data.volume.name,
          persistentVolumeClaim: {
            claimName: getName(uploadedDataVolume),
            ...(isHotPluggable && { hotpluggable: true }),
          },
        };
        delete data.dataVolumeTemplate;
      }
    } else {
      delete data.dataVolumeTemplate;
      delete data.volume;
    }

    const vmWithDisk = addDisk(data, vm);
    const updatedVM = reorderBootDisk(vmWithDisk, data.disk.name, data.isBootSource, false);

    return onSubmit(updatedVM);
  };

  return (
    <FormProvider {...methods}>
      <TabModal
        onClose={async () => {
          if (upload?.uploadStatus) {
            try {
              await upload.cancelUpload();
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
        shouldWrapInForm
        submitBtnText={t('Add')}
      >
        <Stack hasGutter>
          <StackItem>
            {isVMRunning && (
              <PendingChangesAlert title={t('Adding CD-ROM drive')}>
                {t(
                  'CD-ROM drive will be added to the VirtualMachine when it is stopped and restarted.',
                )}
              </PendingChangesAlert>
            )}
            <div className="pf-v6-c-form">
              <DiskNameInput isDisabled={isUploading} />
              <FormGroup>
                <Checkbox
                  id="upload-iso-checkbox"
                  isChecked={uploadEnabled}
                  isDisabled={isUploading}
                  label={t('Upload a new ISO file to the cluster')}
                  onChange={(_event, checked) => setUploadEnabled(checked)}
                />
              </FormGroup>
              {uploadEnabled && (
                <>
                  <DiskSourceUploadPVC label={t('Upload ISO')} relevantUpload={upload} />
                  {hasUploadFile && (
                    <UploadModeSelector
                      isDisabled={isUploading}
                      onUploadModeChange={setUploadMode}
                      uploadMode={uploadMode}
                    />
                  )}
                </>
              )}
            </div>
          </StackItem>
        </Stack>
      </TabModal>
    </FormProvider>
  );
};

export default AddCDROMModal;
