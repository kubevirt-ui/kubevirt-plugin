import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type Template } from '@kubevirt-utils/resources/template';
import { type OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { type VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

export type SelectedInstanceType = { name: string; namespace: null | string };

export type BootSourceOverride = {
  apiGroup: 'cdi.kubevirt.io';
  kind: 'DataSource';
  name: string;
  namespace: string;
};

/** VM identity, placement, and provisioning choices collected across wizard steps. */
type VMWizardVirtualMachineData = {
  autoLabelsMerged: boolean;
  bootSourceOverride: BootSourceOverride | null;
  cluster: string;
  creationMethod: VMCreationMethod;
  description: string;
  folder: string;
  name: string | undefined;
  project: string;
  selectedTemplate: null | Template;
};

/** Ephemeral UI state that does not belong on the VM resource. */
type VMWizardUIState = {
  isTemplatesDrawerOpen: boolean;
  lastProcessedTemplateKey: string;
  shouldCheckVMNameProperly: boolean;
  templateProcessError: null | string;
};

/** Wizard flow position and per-step next-button availability. */
type VMWizardStepNavigation = {
  currentStep: string;
  visitedSteps: Set<string>;
};

/** Guest OS, boot source, and compute resource selections for the instance-type flow. */
type VMWizardInstanceTypeData = {
  customDiskSize: string;
  dvSource: null | V1beta1DataVolume;
  operatingSystemType: OperatingSystemType;
  preference: null | PreferenceOption;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim | null;
  selectedBootableVolume: BootableVolume | null;
  selectedInstanceType: { name: string; namespace: null | string } | null;
  selectedSeries: string;
  selectedSize: string;
  useBootSource: boolean;
  volumeListNamespace: string;
  volumeSnapshotSource: null | VolumeSnapshotKind;
};

export type VMWizardFormValues = {
  instanceTypeData: VMWizardInstanceTypeData;
  stepNavigation: VMWizardStepNavigation;
  uiState: VMWizardUIState;
  vmData: VMWizardVirtualMachineData;
};

export type CreateInitialVMWizardFormValuesArgs = {
  cluster: string;
  namespace: string;
};
