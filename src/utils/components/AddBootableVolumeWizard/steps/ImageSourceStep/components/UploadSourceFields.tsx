import { type ChangeEvent, type FC, useState } from 'react';
import { useController } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { type DropEvent, FileUpload, FormGroup } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import { wizardSetValueOptions } from '../../../form/wizardSetValueOptions';
import { setImageSourceIsoFromFilename } from '../utils/setImageSourceDiskSize';

const UploadSourceFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useBootableVolumeWizardForm();
  const [isLoading, setIsLoading] = useState(false);

  const {
    field: { value: uploadFile },
    fieldState: { error },
  } = useController({ control, name: 'imageSource.upload.file' });

  const {
    field: { value: uploadFilename },
  } = useController({ control, name: 'imageSource.upload.filename' });

  const { message, validated } = getFieldValidationState(error);

  const clearUpload = (): void => {
    setValue('imageSource.upload.file', undefined, wizardSetValueOptions);
    setValue('imageSource.upload.filename', '', wizardSetValueOptions);
    setImageSourceIsoFromFilename(setValue, '');
  };

  return (
    <FormGroup fieldId="disk-source-upload" isRequired label={t('Upload file')}>
      <FileUpload
        allowEditingUploadedText={false}
        browseButtonText={t('Upload')}
        clearButtonText={t('Clear')}
        filename={uploadFilename}
        filenamePlaceholder={t('Drag and drop an image or upload one')}
        id="bootable-volume-upload-file"
        isLoading={isLoading}
        onClearClick={clearUpload}
        onDataChange={(_event: DropEvent, droppedFile: string) => {
          setValue('imageSource.upload.file', droppedFile, wizardSetValueOptions);
        }}
        onFileInputChange={(_event, file: File) => {
          setValue('imageSource.upload.filename', file.name, wizardSetValueOptions);
          setValue('imageSource.upload.file', file, wizardSetValueOptions);
          setImageSourceIsoFromFilename(setValue, file.name);
        }}
        onReadFinished={() => setIsLoading(false)}
        onReadStarted={() => setIsLoading(true)}
        onTextChange={(_event: ChangeEvent<HTMLTextAreaElement>, value: string) => {
          setValue('imageSource.upload.file', value, wizardSetValueOptions);
        }}
        value={uploadFile}
      />
      {message && <FormGroupHelperText validated={validated}>{message}</FormGroupHelperText>}
    </FormGroup>
  );
};

export default UploadSourceFields;
