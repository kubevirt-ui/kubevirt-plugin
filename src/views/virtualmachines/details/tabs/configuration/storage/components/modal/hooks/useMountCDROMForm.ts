import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

// Modal-specific constants
const UPLOAD_MODE_SELECT = 'select';
const UPLOAD_MODE_UPLOAD = 'upload';
const FORM_FIELD_SELECTED_ISO = 'selectedISO';
const FORM_FIELD_UPLOAD_MODE = 'uploadMode';
const FORM_FIELD_UPLOAD_FILE = 'uploadFile';

type MountCDROMFormState = {
  selectedISO?: string;
  uploadFile?: File;
  uploadMode: typeof UPLOAD_MODE_SELECT | typeof UPLOAD_MODE_UPLOAD;
};

export const useMountCDROMForm = () => {
  const [uploadFilename, setUploadFilename] = useState('');

  const methods = useForm<MountCDROMFormState>({
    defaultValues: {
      [FORM_FIELD_SELECTED_ISO]: '',
      [FORM_FIELD_UPLOAD_FILE]: null,
      [FORM_FIELD_UPLOAD_MODE]: UPLOAD_MODE_SELECT,
    },
    mode: 'all',
  });

  const { control, setValue } = methods;

  const uploadMode = useWatch({ control, name: FORM_FIELD_UPLOAD_MODE });
  const selectedISO = useWatch({ control, name: FORM_FIELD_SELECTED_ISO });
  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });

  const handleISOSelection = (selectedValue: string) => {
    setValue(FORM_FIELD_SELECTED_ISO, selectedValue);
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_SELECT);
    setValue(FORM_FIELD_UPLOAD_FILE, null);
    setUploadFilename('');
  };

  const handleFileUpload = (file: File) => {
    setValue(FORM_FIELD_UPLOAD_FILE, file);
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_UPLOAD);
    setValue(FORM_FIELD_SELECTED_ISO, '');
    setUploadFilename(file.name);
  };

  const handleClearUpload = () => {
    setValue(FORM_FIELD_UPLOAD_FILE, null);
    setUploadFilename('');
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_SELECT);
  };

  const isFormValid = Boolean(selectedISO || uploadFile);

  return {
    handleClearUpload,
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
