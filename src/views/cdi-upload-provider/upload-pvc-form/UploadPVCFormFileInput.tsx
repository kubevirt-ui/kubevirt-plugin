import React, { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FileUpload, FormGroup } from '@patternfly/react-core';

type UploadPVCFormFileInputProps = {
  fileName: string;
  fileValue: File | string;
  handleFileChange: (event, value: File) => void;
  handleFileNameChange: (event, file: string) => void;
  handleGoldenCheckbox: (checked: boolean) => void;
  isGolden: boolean;
  operatingSystemHaveDV: boolean;
  setIsFileRejected: (value: boolean) => void;
};

const UploadPVCFormFileInput: FC<UploadPVCFormFileInputProps> = ({
  fileName,
  fileValue,
  handleFileChange,
  handleFileNameChange,
  handleGoldenCheckbox,
  isGolden,
  operatingSystemHaveDV,
  setIsFileRejected,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="file-upload" isRequired label={t('Upload data')}>
      <FileUpload
        browseButtonText="Upload"
        className="upload-pvc-form__file-upload"
        dropzoneProps={{
          accept: { 'application/*': ['.iso,.img,.qcow2,.gz,.xz'] },
          onDropAccepted: () => setIsFileRejected(false),
          onDropRejected: () => setIsFileRejected(true),
        }}
        filename={fileName}
        filenamePlaceholder="Drag and drop a file or upload one"
        hideDefaultPreview
        id="file-upload"
        onClearClick={(event) => {
          handleFileChange(event, null);
          handleFileNameChange(event, '');
        }}
        onFileInputChange={(event, file: File) => {
          handleFileChange(event, file);
          handleFileNameChange(event, file.name);
        }}
        value={fileValue}
      />
      {operatingSystemHaveDV && (
        <Checkbox
          className="kv--create-upload__golden-switch"
          data-checked-state={isGolden}
          id="golden-os-switch"
          isChecked={isGolden}
          label={t('Attach this data to a VirtualMachine operating system')}
          onChange={(_event, checked: boolean) => handleGoldenCheckbox(checked)}
        />
      )}
    </FormGroup>
  );
};

export default UploadPVCFormFileInput;
