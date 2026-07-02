import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Template } from '@kubevirt-utils/resources/template';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { VMCreationMethod } from '@virtualmachines/creation-wizard-new/utils/constants';

export type SelectedInstanceType = { name: string; namespace: null | string };

/** VM identity, placement, and provisioning choices collected across wizard steps. */
type VMWizardVirtualMachineData = {
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
};

/** Wizard flow position and per-step next-button availability. */
type VMWizardStepNavigation = {
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
