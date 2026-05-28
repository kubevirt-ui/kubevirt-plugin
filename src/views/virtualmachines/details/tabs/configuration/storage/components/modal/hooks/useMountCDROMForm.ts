import { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { UPLOAD_FILENAME_FIELD } from '@kubevirt-utils/components/DiskModal/components/utils/constants';
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

export type UseMountCDROMFormOptions = {
  /** Clears upload filename on a separate form (e.g. Add CD-ROM disk form). */
  clearExtraUploadFilename?: () => void;
};

type UseMountCDROMFormReturn = {
  handleClearUpload: (resetMode?: boolean) => void;
  handleClearUploadAndFilename: () => void;
  handleEmptyDriveSelection: () => void;
  handleFileUpload: () => void;
  handleISOSelect: (value: string) => void;
  handleISOSelection: (selectedValue: string) => void;
  isFormValid: boolean;
  methods: ReturnType<typeof useForm<MountCDROMFormState>>;
  selectedISO: string;
  uploadFile: MountCDROMFormState['uploadFile'];
  uploadFilename: string;
  uploadMode: MountCDROMFormState['uploadMode'];
};

export const useMountCDROMForm = (options?: UseMountCDROMFormOptions): UseMountCDROMFormReturn => {
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

  const handleClearUpload = useCallback(
    (resetMode: boolean = true) => {
      clearErrors(FORM_FIELD_UPLOAD_FILE);
      setValue(FORM_FIELD_UPLOAD_FILE, null);
      setUploadFilename('');
      if (resetMode) {
        setValue(FORM_FIELD_UPLOAD_MODE, '');
      }
    },
    [clearErrors, setValue],
  );

  const handleISOSelection = useCallback(
    (selectedValue: string) => {
      setValue(FORM_FIELD_SELECTED_ISO, selectedValue);
      setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_SELECT);
      handleClearUpload(false);
    },
    [setValue, handleClearUpload],
  );

  const handleFileUpload = useCallback(() => {
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_UPLOAD);
    setValue(FORM_FIELD_SELECTED_ISO, '');
  }, [setValue]);

  const handleEmptyDriveSelection = useCallback(() => {
    setValue(FORM_FIELD_UPLOAD_MODE, UPLOAD_MODE_EMPTY);
    setValue(FORM_FIELD_SELECTED_ISO, '');
    handleClearUpload(false);
  }, [setValue, handleClearUpload]);

  const clearExtraUploadFilename = options?.clearExtraUploadFilename;

  const clearUploadFilenameFields = useCallback(() => {
    setValue(UPLOAD_FILENAME_FIELD, '');
    clearExtraUploadFilename?.();
  }, [clearExtraUploadFilename, setValue]);

  const handleISOSelect = useCallback(
    (value: string) => {
      handleISOSelection(value);
      clearUploadFilenameFields();
    },
    [handleISOSelection, clearUploadFilenameFields],
  );

  const handleClearUploadAndFilename = useCallback(() => {
    handleClearUpload();
    clearUploadFilenameFields();
  }, [handleClearUpload, clearUploadFilenameFields]);

  const isFormValid = Boolean(selectedISO || uploadFile?.filename);

  return {
    handleClearUpload,
    handleClearUploadAndFilename,
    handleEmptyDriveSelection,
    handleFileUpload,
    handleISOSelect,
    handleISOSelection,
    isFormValid,
    methods,
    selectedISO,
    uploadFile,
    uploadFilename,
    uploadMode,
  };
};
