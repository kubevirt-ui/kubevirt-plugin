import * as React from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FileUpload, FormGroup } from '@patternfly/react-core';

import { DiskSourceUploadPVCProgress } from './DiskSourceUploadPVCProgress';

type DiskSourceUploadPVCProps = {
  relevantUpload: DataUpload;
  uploadFileName: string;
  uploadFile: File | string;
  setUploadFileName: (name: string) => void;
  setUploadFile: (file: File | string) => void;
};

const DiskSourceUploadPVC: React.FC<DiskSourceUploadPVCProps> = ({
  relevantUpload,
  uploadFile,
  uploadFileName,
  setUploadFile,
  setUploadFileName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup label={t('Upload Data')} fieldId="disk-source-upload" isRequired>
        <FileUpload
          id="simple-file"
          data-test-id="disk-source-upload-pvc-file"
          value={uploadFile}
          filename={uploadFileName}
          filenamePlaceholder={t('Drag and drop an image or upload one')}
          onChange={(value, filename) => {
            setUploadFile(value);
            setUploadFileName(filename);
          }}
        />
      </FormGroup>
      {relevantUpload && <DiskSourceUploadPVCProgress upload={relevantUpload} />}
    </>
  );
};

export default DiskSourceUploadPVC;
