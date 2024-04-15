import React, { FC, useState } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload, FormGroup, ValidatedOptions } from '@patternfly/react-core';

import {
  diskSourceUploadFieldID,
  uploadFileField,
  uploadFilenameField,
} from '../../utils/constants';

import { DiskSourceUploadPVCProgress } from './DiskSourceUploadPVCProgress';

type DiskSourceUploadPVCProps = {
  label?: string;
  relevantUpload: DataUpload;
};

const DiskSourceUploadPVC: FC<DiskSourceUploadPVCProps> = ({ label, relevantUpload }) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<DiskFormState>();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFilename = watch(uploadFilenameField);

  const error = errors?.upload?.uploadFile;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <>
          <FormGroup fieldId={diskSourceUploadFieldID} isRequired label={label || t('Upload data')}>
            <FileUpload
              onClearClick={() => {
                onChange('');
                setValue<FieldPath<DiskFormState>>(uploadFilenameField, '');
              }}
              onFileInputChange={(_, file: File) => {
                onChange(file);
                setValue<FieldPath<DiskFormState>>(uploadFilenameField, file.name);
              }}
              allowEditingUploadedText={false}
              browseButtonText={t('Upload')}
              data-test-id={diskSourceUploadFieldID}
              filename={uploadFilename}
              filenamePlaceholder={t('Drag and drop an image or upload one')}
              id="simple-file"
              isLoading={isLoading}
              onDataChange={(_event: DropEvent, droppedFile: string) => onChange(droppedFile)}
              onReadFinished={() => setIsLoading(false)}
              onReadStarted={() => setIsLoading(true)}
              value={value}
            />
            {error && (
              <FormGroupHelperText validated={ValidatedOptions.error}>
                {error?.message}
              </FormGroupHelperText>
            )}
          </FormGroup>
          {relevantUpload && <DiskSourceUploadPVCProgress upload={relevantUpload} />}
        </>
      )}
      control={control}
      name={uploadFileField}
      rules={{ required: t('File is required.') }}
    />
  );
};

export default DiskSourceUploadPVC;
