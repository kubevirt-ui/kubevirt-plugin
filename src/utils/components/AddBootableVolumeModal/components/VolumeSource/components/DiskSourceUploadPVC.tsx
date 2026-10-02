import { type ChangeEvent, type FC, useState } from 'react';

import {
  type AddBootableVolumeState,
  type SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type DropEvent, FileUpload, FormGroup } from '@patternfly/react-core';

import DiskSourceUploadISO from './DiskSourceUploadISO';
import { DiskSourceUploadPVCProgress } from './DiskSourceUploadPVCProgress';

type DiskSourceUploadPVCProps = {
  bootableVolume: AddBootableVolumeState;
  label?: string;
  relevantUpload: DataUpload;
  setBootableVolumeField: SetBootableVolumeFieldType;
  setUploadFile: (file: File | string) => void;
  setUploadFileName: (name: string) => void;
  uploadFile: File | string;
  uploadFileName: string;
};

const DiskSourceUploadPVC: FC<DiskSourceUploadPVCProps> = ({
  bootableVolume,
  label,
  relevantUpload,
  setBootableVolumeField,
  setUploadFile,
  setUploadFileName,
  uploadFile,
  uploadFileName,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useKubevirtTranslation();
  const isUploading = isUploadingDisk(relevantUpload?.uploadStatus);

  return (
    <>
      <FormGroup fieldId="disk-source-upload" isRequired label={label ?? t('Upload data')}>
        <FileUpload
          allowEditingUploadedText={false}
          browseButtonText={t('Upload')}
          filename={uploadFileName}
          filenamePlaceholder={t('Drag and drop an image or upload one')}
          id="simple-file"
          isDisabled={isUploading || isLoading}
          isLoading={isLoading}
          onClearClick={() => {
            setUploadFile('');
            setUploadFileName('');
          }}
          onDataChange={(_event: DropEvent, droppedFile: string) => setUploadFile(droppedFile)}
          onFileInputChange={(_event, file: File) => {
            setUploadFileName(file.name);
            setUploadFile(file);
          }}
          onReadFinished={() => setIsLoading(false)}
          onReadStarted={() => setIsLoading(true)}
          onTextChange={(_event: ChangeEvent<HTMLTextAreaElement>, value: string) =>
            setUploadFile(value)
          }
          value={uploadFile}
        />
      </FormGroup>
      <DiskSourceUploadISO
        bootableVolume={bootableVolume}
        isDisabled={isUploading}
        setBootableVolumeField={setBootableVolumeField}
      />
      {relevantUpload && <DiskSourceUploadPVCProgress upload={relevantUpload} />}
    </>
  );
};

export default DiskSourceUploadPVC;
