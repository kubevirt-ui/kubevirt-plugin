import * as React from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FileUpload, FormGroup } from '@patternfly/react-core';

import { DiskSourceUploadPVCProgress } from './DiskSourceUploadPVCProgress';

type DiskSourceUploadPVCProps = {
  label?: string;
  relevantUpload: DataUpload;
  setUploadFile: (file: File | string) => void;
  setUploadFileName: (name: string) => void;
  uploadFile: File | string;
  uploadFileName: string;
};

const DiskSourceUploadPVC: React.FC<DiskSourceUploadPVCProps> = ({
  label,
  relevantUpload,
  setUploadFile,
  setUploadFileName,
  uploadFile,
  uploadFileName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup fieldId="disk-source-upload" isRequired label={label || t('Upload data')}>
        <FileUpload
          onChange={(value, filename) => {
            setUploadFile(value);
            setUploadFileName(filename);
          }}
          data-test-id="disk-source-upload-pvc-file"
          filename={uploadFileName}
          filenamePlaceholder={t('Drag and drop an image or upload one')}
          id="simple-file"
          value={uploadFile}
        />
      </FormGroup>
      {relevantUpload && <DiskSourceUploadPVCProgress upload={relevantUpload} />}
    </>
  );
};

export default DiskSourceUploadPVC;
