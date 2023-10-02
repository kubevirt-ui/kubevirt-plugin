import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { FileUpload, FormGroup, Stack, StackItem, ValidatedOptions } from '@patternfly/react-core';

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

  return (
    <FormGroup
      validated={
        errors?.[`${testId}-uploadFile`] ? ValidatedOptions.error : ValidatedOptions.default
      }
      className="disk-source-form-group"
      fieldId={`${testId}-${UPLOAD_SOURCE_NAME}`}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      isRequired
      label={t('Upload data')}
    >
      <Stack hasGutter>
        <StackItem>
          <Controller
            render={({ field: { onChange, value: fileValue }, fieldState: { error } }) => (
              <FileUpload
                onChange={(value, filename) => {
                  onChange({ filename, value });
                  onFileSelected(value);
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
        </StackItem>
        <StackItem>
          {relevantUpload && <SelectSourceUploadPVCProgress upload={relevantUpload} />}
        </StackItem>
      </Stack>
    </FormGroup>
  );
};

export default UploadSource;
