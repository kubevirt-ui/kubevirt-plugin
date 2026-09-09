import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { type SelectProps } from '@patternfly/react-core';

export type SelfValidationStorageSubmit = {
  pvcSize: string;
  storageCapabilities: string[];
  storageClass: string;
};

export type WindowsValidationSubmit = {
  isEulaConfirmed: boolean;
  windowsServerTesting: boolean;
  winImageDownloadUrl: string;
};

export type AdvancedSettingsProps = {
  cluster: string | undefined;
  isDryRun: boolean;
  onStorageChange: (storage: SelfValidationStorageSubmit) => void;
  selectedTestSuites: string[];
  setIsDryRun: (checked: boolean) => void;
  setTestSkips: (testSkips: string) => void;
  testSkips: string;
};

export type CheckupsSelfValidationFormActionsProps = {
  checkupImage: string;
  isDryRun: boolean;
  isEulaConfirmed: boolean;
  name: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities?: string[];
  storageClass?: string;
  testSkips?: string;
  windowsServerTesting: boolean;
  winImageDownloadUrl?: string;
};

export type HeavyLoadCheckupConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export type RunButtonWithTooltipProps = {
  configMapInfo: { cluster?: string; name: string; namespace: string } | null;
  eulaPendingConfirmation: boolean;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  onClick: () => void;
  showRunningCheckupTooltip: boolean;
  showTooltip: boolean;
};

export type WindowsValidationSettingsProps = {
  onWindowsChange: (state: WindowsValidationSubmit) => void;
  pipelinesInstalled: boolean;
  pipelinesLoaded: boolean;
  selectedTestSuites: string[];
};

export type CheckupFormState = {
  checkupImage: string | undefined;
  checkupImageIsFallback: boolean;
  checkupImageLoaded: boolean;
  checkupImageLoadError: Error;
  claimPropertySets: ClaimPropertySets;
  effectiveStorageClass: string;
  handleStorageCapabilitySelect: SelectProps['onSelect'];
  handleTestSuiteSelect: SelectProps['onSelect'];
  isDryRun: boolean;
  name: string;
  pipelinesInstalled: boolean;
  pipelinesLoaded: boolean;
  pvcSize: string;
  selectedTestSuites: string[];
  setIsDryRun: React.Dispatch<React.SetStateAction<boolean>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setPvcSize: React.Dispatch<React.SetStateAction<string>>;
  setStorageClass: React.Dispatch<React.SetStateAction<string>>;
  setTestSkips: React.Dispatch<React.SetStateAction<string>>;
  storageCapabilities: string[];
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesLoaded: boolean;
  storageProfileError: boolean;
  storageProfileLoaded: boolean;
  testSkips: string;
  testSuitesToggleTitle: string;
  windowsState: {
    isEulaConfirmed: boolean;
    isTier2Selected: boolean;
    setIsEulaConfirmed: (checked: boolean) => void;
    setWindowsServerTesting: (checked: boolean) => void;
    setWinImageDownloadUrl: (url: string) => void;
    windowsServerTesting: boolean;
    winImageDownloadUrl: string;
  };
};
