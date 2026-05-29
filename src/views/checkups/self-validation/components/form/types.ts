import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { SelectProps } from '@patternfly/react-core';

export type AdvancedSettingsProps = {
  effectiveStorageClassName: string;
  handleStorageCapabilitySelect: SelectProps['onSelect'];
  isDryRun: boolean;
  pvcSize: string;
  setIsDryRun: (checked: boolean) => void;
  setPvcSize: (size: string) => void;
  setStorageClass: (storageClass: string) => void;
  setTestSkips: (testSkips: string) => void;
  storageCapabilities: string[];
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesLoaded: boolean;
  storageProfileError: boolean;
  storageProfileHasClaimPropertySets: boolean;
  storageProfileLoaded: boolean;
  testSkips: string;
};

export type CheckupsSelfValidationFormActionsProps = {
  acceptWindowsEula: boolean;
  checkupImage: string;
  isDryRun: boolean;
  isEulaConfirmed: boolean;
  name: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  winImageDownloadUrl?: string;
  winImageName?: string;
};

export type HeavyLoadCheckupConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export type RunButtonWithTooltipProps = {
  configMapInfo: { cluster: string; name: string; namespace: string } | null | undefined;
  eulaPendingConfirmation: boolean;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  onClick: () => void;
  showRunningCheckupTooltip: boolean | undefined;
  showTooltip: boolean | undefined;
};

export type WindowsValidationSettingsProps = {
  acceptWindowsEula: boolean;
  dataSourceOptions: EnhancedSelectOptionProps[];
  dataSourcesError: boolean;
  dataSourcesLoaded: boolean;
  isEulaConfirmed: boolean;
  isTier2Selected: boolean;
  setAcceptWindowsEula: (checked: boolean) => void;
  setIsEulaConfirmed: (checked: boolean) => void;
  setWinImageDownloadUrl: (url: string) => void;
  setWinImageName: (name: string) => void;
  winImageDownloadUrl: string;
  winImageName: string;
};
