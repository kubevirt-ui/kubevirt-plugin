import { TFunction } from 'i18next';
import { FC, ReactNode } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { NavigateFunction } from 'react-router';

import {
  V1beta1DataImportCron,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClone,
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { WizardStepProps, WizardStepType } from '@patternfly/react-core';
import { VMWizardStep } from '@virtualmachines/wizard/utils/constants';

import { VMWizardFormValues } from '../state/vm-wizard-form/types';

export type VMGenerationNavItemClickHandler = (
  step: WizardStepType,
  activeStep: WizardStepType,
  goToStepByIndex: (index: number) => void,
) => Promise<void> | void;

export type WizardStepNavItemConfig = {
  handleNavItemClick: VMGenerationNavItemClickHandler;
  isGeneratingVM: boolean;
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
  loadError: any;
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
  submittedCloneRequest: undefined | V1beta1VirtualMachineClone;
  setSubmittedCloneRequest: (cloneRequest: undefined | V1beta1VirtualMachineClone) => void;
  t: TFunction;
};
