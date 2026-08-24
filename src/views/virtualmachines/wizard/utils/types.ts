import { type TFunction } from 'i18next';
import { type FC, type ReactNode } from 'react';
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { type NavigateFunction } from 'react-router';

import {
  type V1beta1DataImportCron,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1beta1VirtualMachineClone,
  type V1beta1VirtualMachineClusterInstancetype,
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { type WizardStepProps, type WizardStepType } from '@patternfly/react-core';
import { type VMWizardStep } from '@virtualmachines/wizard/utils/constants';

import { type VMWizardFormValues } from '../state/vm-wizard-form/types';

export type VMGenerationNavItemClickHandler = (
  step: WizardStepType,
  activeStep: WizardStepType,
  goToStepByIndex: (index: number) => void,
) => Promise<void> | void;

export type WizardStepNavItemConfig = {
  handleNavItemClick: VMGenerationNavItemClickHandler;
  isGeneratingVM: boolean;
  loaded: boolean;
};

export type VMWizardStepDisplay = WizardStepProps & {
  children: ReactNode;
  displayIndex: number;
};

export type GetStepsToDisplayByCreationMethodArgs = {
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
  navItemConfig: WizardStepNavItemConfig;
  t: TFunction;
};

export type InstanceTypes = (
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype
)[];

export type UseInstanceTypeAndPreferencesValues = {
  allInstanceTypes: InstanceTypes;
  clusterInstanceTypes: V1beta1VirtualMachineClusterInstancetype[];
  loaded: boolean;
  loadError: Error | undefined;
  preferences: V1beta1VirtualMachineClusterPreference[];
};

export type UseBootableVolumesValues = {
  bootableVolumes: BootableVolume[];
  dataImportCrons: V1beta1DataImportCron[];
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>;
  error: Error;
  loaded: boolean;
  pvcSources: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  volumeSnapshotSources: { [dataSourceName: string]: VolumeSnapshotKind };
};

export type ApplySelectedBootableVolumeToForm = {
  dvSource: null | V1beta1DataVolume;
  getValues: UseFormGetValues<VMWizardFormValues>;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim | null;
  selectedVolume: BootableVolume;
  setValue: UseFormSetValue<VMWizardFormValues>;
  volumeSnapshotSource: null | VolumeSnapshotKind;
};

export type VMCreationMethodCardDetails = {
  description: string;
  IconComponent: FC;
  label: string;
};

export type VMCreationMethodConfig = {
  activeFlow: VMWizardStep[];
  cardDetails: (t: TFunction) => VMCreationMethodCardDetails;
};

export type HandleWizardStepClick = {
  currentStep: WizardStepType;
  getValues: UseFormGetValues<VMWizardFormValues>;
  hasLoggedCreationStarted: { current: boolean };
  setValue: UseFormSetValue<VMWizardFormValues>;
};

export type HandleCloneRequestPhaseChangeParams = {
  cloneRequest: undefined | V1beta1VirtualMachineClone;
  formValues: VMWizardFormValues['vmData'];
  navigate: NavigateFunction;
  setError: (error: unknown) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setSubmittedCloneRequest: (cloneRequest: undefined | V1beta1VirtualMachineClone) => void;
  submittedCloneRequest: undefined | V1beta1VirtualMachineClone;
  t: TFunction;
};

export type GetClusterInitialValueParams = {
  clusterFromLocalStorage?: string;
  clusterFromNavigate?: string;
  hubClusterName?: string;
  isACM: boolean;
};
