import React, { FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { mountISOToCDROM } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { InterfaceTypes, V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import {
  ButtonVariant,
  FileUpload,
  Form,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { updateDisks } from '../../../details/utils/utils';

type MountCDROMFormState = {
  selectedISO?: string;
  uploadFile?: File;
  uploadMode: 'select' | 'upload';
};

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
  const [uploadFilename, setUploadFilename] = useState('');

  const vmNamespace = getNamespace(vm);

  const [pvcs, pvcsLoaded] = usePVCs(vmNamespace);

  const methods = useForm<MountCDROMFormState>({
    defaultValues: {
      selectedISO: '',
      uploadFile: null,
      uploadMode: 'select',
    },
    mode: 'all',
  });

  const { setValue, watch } = methods;

  const formData = watch();

  const isoOptions = React.useMemo(() => {
    if (!pvcsLoaded || !pvcs) return [];

    return pvcs
      .filter((pvc) => {
        const name = getName(pvc);
        return (
          name.toLowerCase().includes('iso') ||
          name.toLowerCase().includes('cd') ||
          name.toLowerCase().includes('image')
        );
      })
      .map((pvc) => ({
        children: getName(pvc),
        value: getName(pvc),
      }));
  }, [pvcs, pvcsLoaded]);

  const handleISOSelection = (selectedValue: string) => {
    setValue('selectedISO', selectedValue);
    setValue('uploadMode', 'select');
    setValue('uploadFile', null);
    setUploadFilename('');
  };

  const handleFileUpload = (file: File) => {
    setValue('uploadFile', file);
    setValue('uploadMode', 'upload');
    setValue('selectedISO', '');
    setUploadFilename(file.name);
  };

  const buildDiskState = (): V1DiskFormState => {
    if (formData.uploadMode === 'upload' && formData.uploadFile) {
      const uploadDataVolumeName = `${vm?.metadata?.name}-${cdromName}-${generatePrettyName(
        'upload',
      )}`;

      return {
        dataVolumeTemplate: {
          metadata: {
            name: uploadDataVolumeName,
            namespace: vmNamespace,
          },
          spec: {
            source: {
              upload: {},
            },
            storage: {
              resources: {
                requests: {
                  storage: '10Gi',
                },
              },
            },
          },
        },
        disk: {
          cdrom: { bus: InterfaceTypes.SATA },
          name: cdromName,
        },
        isBootSource: false,
        uploadFile: {
          file: formData.uploadFile,
          filename: uploadFilename,
        },
        volume: {
          dataVolume: {
            name: uploadDataVolumeName,
          },
          name: cdromName,
        },
      };
    } else if (formData.uploadMode === 'select' && formData.selectedISO) {
      return {
        disk: {
          cdrom: { bus: InterfaceTypes.SATA },
          name: cdromName,
        },
        isBootSource: false,
        volume: {
          name: cdromName,
          persistentVolumeClaim: {
            claimName: formData.selectedISO,
          },
        },
      };
    }
    return null;
  };

  const handleMount = async () => {
    const diskState = buildDiskState();
    if (!diskState) return;

    const updatedVM = await mountISOToCDROM(vm, diskState);

    if (onSubmit) {
      return onSubmit(updatedVM);
    }
    return updateDisks(updatedVM);
  };

  const isFormValid = formData.selectedISO || formData.uploadFile;

  return (
    <FormProvider {...methods}>
      <TabModal<V1VirtualMachine>
        headerText={t('Mount ISO')}
        isDisabled={!isFormValid}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleMount}
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form>
          <Stack hasGutter>
            <StackItem>
              <p>{t('Mount ISO to the Virtual Machine')}</p>
            </StackItem>
            <StackItem>
              <FormGroup fieldId="select-iso" isRequired label={t('Select ISO')}>
                <InlineFilterSelect
                  toggleProps={{
                    isFullWidth: true,
                    placeholder: t('Select or upload a new ISO file to the cluster'),
                  }}
                  options={isoOptions}
                  selected={formData.selectedISO}
                  setSelected={handleISOSelection}
                />
              </FormGroup>
            </StackItem>
            <StackItem>
              <FormGroup fieldId="upload-iso" label={t('Upload ISO')}>
                <FileUpload
                  dropzoneProps={{
                    accept: { 'application/*': ['.iso'] },
                  }}
                  onClearClick={() => {
                    setValue('uploadFile', null);
                    setUploadFilename('');
                    setValue('uploadMode', 'select');
                  }}
                  browseButtonText={t('Upload')}
                  clearButtonText={t('Clear')}
                  filename={uploadFilename}
                  filenamePlaceholder={t('Drag and drop a file or upload')}
                  id="upload-iso-input"
                  onFileInputChange={(_, file: File) => handleFileUpload(file)}
                  value={formData.uploadFile}
                />
                <p className="pf-v6-u-mt-sm pf-v6-u-color-200">
                  {t('ISO file must be in the same project as the Virtual Machine')}
                </p>
              </FormGroup>
            </StackItem>
          </Stack>
        </Form>
      </TabModal>
    </FormProvider>
  );
};

export default MountCDROMModal;
