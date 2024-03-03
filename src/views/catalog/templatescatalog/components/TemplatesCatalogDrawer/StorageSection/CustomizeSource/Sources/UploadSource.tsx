import React, { ChangeEvent, FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DropEvent,
  FileUpload,
  FormGroup,
  Stack,
  StackItem,
  ValidatedOptions,
} from '@patternfly/react-core';

import { UPLOAD_SOURCE_NAME } from '../../constants';

import { SelectSourceUploadPVCProgress } from './SelectSourceUploadPVCProgress';

type UploadSourceProps = {
  onFileSelected: (file: File | string) => void;
  relevantUpload: DataUpload;
  testId: string;
};

const UploadSource: FC<UploadSourceProps> = ({ onFileSelected, relevantUpload, testId }) => {
  const { t } = useKubevirtTranslation();

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const validated = errors?.[`${testId}-uploadFile`]
    ? ValidatedOptions.error
    : ValidatedOptions.default;
  return (
    <FormGroup
      className="disk-source-form-group"
      fieldId={`${testId}-${UPLOAD_SOURCE_NAME}`}
      isRequired
      label={t('Upload data')}
    >
      <Stack hasGutter>
        <StackItem>
          <Controller
            render={({ field: { onChange, value: fileValue }, fieldState: { error } }) => (
              <FileUpload
                onDataChange={(event: DropEvent, data: string) => {
                  onFileSelected(data);
                  onChange({ value: data });
                }}
                onFileInputChange={(event: DropEvent, file: File) => {
                  onFileSelected(file);
                  onChange({ filename: file.name });
                }}
                onTextChange={(event: ChangeEvent, text: string) => {
                  onFileSelected(text);
                  onChange({ value: text });
                }}
                data-test-id="disk-source-upload-pvc-file"
                filename={fileValue?.filename}
                filenamePlaceholder={t('Drag and drop an image or upload one')}
                id={`${testId}-uploadFile`}
                name={`${testId}-uploadFile`}
                onClearClick={() => onChange(undefined)}
                validated={error ? ValidatedOptions.error : ValidatedOptions.default}
                value={fileValue?.value}
              />
            )}
            control={control}
            name={`${testId}-uploadFile`}
            rules={{ required: true }}
            shouldUnregister
          />
          <FormGroupHelperText validated={validated}>
            {validated === ValidatedOptions.error && t('This field is required')}
          </FormGroupHelperText>
        </StackItem>
        <StackItem>
          {relevantUpload && <SelectSourceUploadPVCProgress upload={relevantUpload} />}
        </StackItem>
      </Stack>
    </FormGroup>
  );
};

export default UploadSource;
