import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type Template } from '@kubevirt-utils/resources/template';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { type VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

export type BootVolumeSelection = {
  dataVolumeSource?: null | V1beta1DataVolume;
  diskSize?: string;
  persistentVolumeClaimSource?: IoK8sApiCoreV1PersistentVolumeClaim | null;
  volume: BootableVolume;
  volumeSnapshotSource?: null | VolumeSnapshotKind;
};

export type InstanceTypeSelection =
  | {
      name: string;
      series: string;
      size: string;
      type: 'redhat';
    }
  | {
      name: string;
      namespace: string;
      type: 'user';
    };

export type VMWizardDeploymentValues = {
  cluster: string;
  description: string;
  folder: string;
  name: string | undefined;
  project: string;
};

export type VMWizardInstanceTypeValues = {
  bootVolume: BootVolumeSelection | null;
  compute: InstanceTypeSelection | null;
  operatingSystem: OperatingSystemType;
  preference: null | PreferenceOption;
  useBootSource: boolean;
  volumeNamespace: string;
};

export type VMWizardTemplateValues = {
  // Preserve the existing template processing cache.
  lastProcessedKey: string;
  selectedTemplate: null | Template;
};

export type VMWizardCloneValues = {
  sourceVM: null | V1VirtualMachine;
};

export type VMWizardCustomizationValues = {
  autoLabelsApplied: boolean;
  pendingBootableVolumeUploadKeys: string[];
  templateAdditionalObjects: K8sResourceCommon[];
  vmDraft: null | V1VirtualMachine;
};

export type VMWizardFormValues = {
  clone: VMWizardCloneValues;
  creationMethod: VMCreationMethod;
  customization: VMWizardCustomizationValues;
  deployment: VMWizardDeploymentValues;
  instanceType: VMWizardInstanceTypeValues;
  template: VMWizardTemplateValues;
};

export type CreateInitialVMWizardFormValuesArgs = Partial<VMWizardDeploymentValues> & {
  creationMethod?: VMCreationMethod;
};
