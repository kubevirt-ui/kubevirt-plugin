import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  FORM_FIELD_UPLOAD_FILE,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

const FORM_FIELD_SELECTED_ISO = 'selectedISO';
const FORM_FIELD_UPLOAD_MODE = 'uploadMode';
const FORM_FIELD_UPLOAD_TYPE = 'uploadType';

type MountCDROMFormState = {
  selectedISO?: string;
  uploadFile?: { file: File; filename: string };
  uploadMode: '' | typeof UPLOAD_MODE_SELECT | typeof UPLOAD_MODE_UPLOAD;
  uploadType: VolumeTypes.DATA_VOLUME | VolumeTypes.PERSISTENT_VOLUME_CLAIM;
};

export const useMountCDROMForm = () => {
  const [uploadFilename, setUploadFilename] = useState('');

  const methods = useForm<MountCDROMFormState>({
    defaultValues: {
      [FORM_FIELD_SELECTED_ISO]: '',
      [FORM_FIELD_UPLOAD_FILE]: null,
      [FORM_FIELD_UPLOAD_MODE]: '',
      [FORM_FIELD_UPLOAD_TYPE]: VolumeTypes.DATA_VOLUME,
    },
    mode: 'all',
  });

  const { clearErrors, control, setValue } = methods;

  const uploadMode = useWatch({ control, name: FORM_FIELD_UPLOAD_MODE });
  const selectedISO = useWatch({ control, name: FORM_FIELD_SELECTED_ISO });
  const uploadFile = useWatch({ control, name: FORM_FIELD_UPLOAD_FILE });
  const uploadType = useWatch({ control, name: FORM_FIELD_UPLOAD_TYPE });

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

  const handleUploadTypeChange = (
    type: VolumeTypes.DATA_VOLUME | VolumeTypes.PERSISTENT_VOLUME_CLAIM,
  ) => {
    setValue(FORM_FIELD_UPLOAD_TYPE, type);
  };

  const isFormValid = Boolean(selectedISO || uploadFile?.filename);

  return {
    handleClearUpload,
    handleFileUpload,
    handleISOSelection,
    handleUploadTypeChange,
    isFormValid,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
    uploadType,
  };
};
