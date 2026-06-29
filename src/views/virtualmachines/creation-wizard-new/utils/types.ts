import { ReactNode } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { TFunction } from 'i18next';

import {
  V1beta1DataImportCron,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { WizardStepProps } from '@patternfly/react-core';
import { VMWizardStep } from '@virtualmachines/creation-wizard-new/utils/constants';

import { VMWizardFormValues } from '../state/vm-wizard-form/types';

export type VMWizardStepDisplay = WizardStepProps & { children: ReactNode; displayIndex: number };

export type GetStepsToDisplayByCreationMethodArgs = {
  customizationStep: VMWizardStepDisplay;
  isNextDisabledForStep: (stepId: VMWizardStep) => boolean;
  isStepDisabled: (stepId: VMWizardStep) => boolean;
  reviewAndCreateStep: VMWizardStepDisplay;
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
