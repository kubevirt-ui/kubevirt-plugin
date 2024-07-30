import React, { FC, useState } from 'react';
import { Controller, FieldPath, useFormContext } from 'react-hook-form';

import { V1DiskFormState } from '@kubevirt-utils/components/DiskModal/utils/types';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload, FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { UPLOAD_FILE_FIELD, UPLOAD_FILENAME_FIELD } from '../../../utils/constants';
import { diskSourceUploadFieldID } from '../../utils/constants';

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
  } = useFormContext<V1DiskFormState>();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFilename = watch(UPLOAD_FILENAME_FIELD);

  const error = errors?.uploadFile;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <>
          <FormGroup fieldId={diskSourceUploadFieldID} isRequired label={label || t('Upload data')}>
            <FileUpload
              onClearClick={() => {
                onChange('');
                setValue<FieldPath<V1DiskFormState>>(UPLOAD_FILENAME_FIELD, '');
              }}
              onFileInputChange={(_, file: File) => {
                onChange(file);
                setValue<FieldPath<V1DiskFormState>>(UPLOAD_FILENAME_FIELD, file.name);
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
      name={UPLOAD_FILE_FIELD}
      rules={{ required: t('File is required.') }}
    />
  );
};

export default DiskSourceUploadPVC;
