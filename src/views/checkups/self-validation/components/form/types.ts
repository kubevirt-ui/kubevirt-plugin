import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { type SelectProps } from '@patternfly/react-core';

import type useWindowsValidationFormState from './useWindowsValidationFormState';

export type CheckupFormState = {
  checkupImage: string;
  checkupImageIsFallback: boolean;
  checkupImageLoaded: boolean;
  checkupImageLoadError: Error | undefined;
  claimPropertySets: ClaimPropertySets | null | undefined;
  effectiveStorageClass: string;
  handleStorageCapabilitySelect: SelectProps['onSelect'];
  handleTestSuiteSelect: SelectProps['onSelect'];
  isDryRun: boolean;
  name: string;
  pipelinesInstalled: boolean;
  pipelinesLoaded: boolean;
  pvcSize: string;
  selectedTestSuites: string[];
  setIsDryRun: (checked: boolean) => void;
  setName: (name: string) => void;
  setPvcSize: (size: string) => void;
  setStorageClass: (storageClass: string) => void;
  setTestSkips: (testSkips: string) => void;
  storageCapabilities: string[];
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesLoaded: boolean;
  storageProfileError: boolean;
  storageProfileLoaded: boolean;
  testSkips: string;
  testSuitesToggleTitle: string;
  windowsState: ReturnType<typeof useWindowsValidationFormState>;
};

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
  checkupImage: string;
  isDryRun: boolean;
  isEulaConfirmed: boolean;
  name: string;
  pvcSize: string;
  selectedTestSuites: string[];
  storageCapabilities: string[];
  storageClass: string;
  testSkips: string;
  windowsServerTesting: boolean;
  winImageDownloadUrl: string;
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
  isEulaConfirmed: boolean;
  isTier2Selected: boolean;
  pipelinesInstalled: boolean;
  pipelinesLoaded: boolean;
  setIsEulaConfirmed: (checked: boolean) => void;
  setWindowsServerTesting: (checked: boolean) => void;
  setWinImageDownloadUrl: (url: string) => void;
  windowsServerTesting: boolean;
  winImageDownloadUrl: string;
};
