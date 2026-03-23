import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  FORM_FIELD_SELECTED_ISO,
  FORM_FIELD_UPLOAD_FILE,
  FORM_FIELD_UPLOAD_MODE,
  UPLOAD_MODE_EMPTY,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';

type MountCDROMFormState = {
  selectedISO?: string;
  uploadFile?: { file: File; filename: string };
  uploadMode: '' | typeof UPLOAD_MODE_EMPTY | typeof UPLOAD_MODE_SELECT | typeof UPLOAD_MODE_UPLOAD;
};

export const useMountCDROMForm = () => {
  const [uploadFilename, setUploadFilename] = useState('');

  const methods = useForm<MountCDROMFormState>({
    defaultValues: {
      [FORM_FIELD_SELECTED_ISO]: '',
      [FORM_FIELD_UPLOAD_FILE]: null,
      [FORM_FIELD_UPLOAD_MODE]: '',
    },
    mode: 'all',
  });

  const { clearErrors, control, setValue } = methods;

  const uploadMode = useWatch({ control, name: FORM_FIELD_UPLOAD_MODE });
  const selectedISO = useWatch({ control, name: FORM_FIELD_SELECTED_ISO });
  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });

  const handleISOSelection = (selectedValue: string) => {
    setValue(FORM_FIELD_SELECTED_ISO, selectedValue);
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_SELECT);
    handleClearUpload(false);
  };

  const handleFileUpload = () => {
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_UPLOAD);
    setValue(FORM_FIELD_SELECTED_ISO, '');
  };

  const handleClearUpload = (resetMode: boolean = true) => {
    clearErrors(FORM_FIELD_UPLOAD_FILE);
    setValue(FORM_FIELD_UPLOAD_FILE, null);
    setUploadFilename('');
    if (resetMode) {
      setValue(FORM_FIELD_UPLOAD_MODE, '');
    }
  };

  const handleEmptyDriveSelection = () => {
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_EMPTY);
    setValue(FORM_FIELD_SELECTED_ISO, '');
    handleClearUpload(false);
  };

  const isFormValid = Boolean(selectedISO || uploadFile?.filename);

  return {
    handleClearUpload,
    handleEmptyDriveSelection,
    handleFileUpload,
    handleISOSelection,
    isFormValid,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
  };
};
