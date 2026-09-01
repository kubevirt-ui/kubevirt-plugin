import { type UseFormReturn } from 'react-hook-form';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';

import { type V1DiskFormState } from '../utils/types';

export type UseAddCDROMModalStateResult = {
  closesOnSubmitAfterSave: boolean;
  emptyDriveOption: {
    description: string;
    isAllowed: boolean;
    isSelected: boolean;
    onSelect: () => void;
  };
  existingISOSelected: boolean;
  handleClearUploadAndFilename: () => void;
  handleFileUpload: () => void;
  handleISOSelect: (iso: string) => void;
  handleModalSubmit: () => Promise<V1VirtualMachine | void>;
  isFormValid: boolean;
  isHotPluggable: boolean;
  isoOptions: EnhancedSelectOptionProps[];
  isSubmitting: boolean;
  isVMRunning: boolean;
  methods: UseFormReturn<V1DiskFormState>;
  selectedISO: string;
  t: TFunction;
  uploadEnabled: boolean;
};
