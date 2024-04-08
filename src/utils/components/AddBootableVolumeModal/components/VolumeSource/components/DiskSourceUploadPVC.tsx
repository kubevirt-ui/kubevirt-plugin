import React, { ChangeEvent, FC, useState } from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DropEvent, FileUpload, FormGroup } from '@patternfly/react-core';

import { DiskSourceUploadPVCProgress } from './DiskSourceUploadPVCProgress';

type DiskSourceUploadPVCProps = {
  label?: string;
  relevantUpload: DataUpload;
  setUploadFile: (file: File | string) => void;
  setUploadFileName: (name: string) => void;
  uploadFile: File | string;
  uploadFileName: string;
};

const DiskSourceUploadPVC: FC<DiskSourceUploadPVCProps> = ({
  label,
  relevantUpload,
  setUploadFile,
  setUploadFileName,
  uploadFile,
  uploadFileName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup fieldId="disk-source-upload" isRequired label={label || t('Upload data')}>
        <FileUpload
          onClearClick={() => {
            setUploadFile('');
            setUploadFileName('');
          }}
          onFileInputChange={(_, file: File) => {
            setUploadFileName(file.name);
            setUploadFile(file);
          }}
          onTextChange={(_event: ChangeEvent<HTMLTextAreaElement>, value: string) =>
            setUploadFile(value)
          }
          allowEditingUploadedText={false}
          browseButtonText={t('Upload')}
          data-test-id="disk-source-upload-pvc-file"
          filename={uploadFileName}
          filenamePlaceholder={t('Drag and drop an image or upload one')}
          id="simple-file"
          isLoading={isLoading}
          onDataChange={(_event: DropEvent, droppedFile: string) => setUploadFile(droppedFile)}
          onReadFinished={() => setIsLoading(false)}
          onReadStarted={() => setIsLoading(true)}
          value={uploadFile}
        />
      </FormGroup>
      {relevantUpload && <DiskSourceUploadPVCProgress upload={relevantUpload} />}
    </>
  );
};

export default DiskSourceUploadPVC;
