import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { type RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

export type GenerateVM = {
  ensureGeneratedVM: () => boolean;
  ready: boolean;
};

export type GenerateVMContext = {
  enableMultiArchBootImageImport?: boolean;
  isIPv6SingleStack?: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  sshSecretName?: string;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
  vmName: string;
};

export type GenerateVMArgs = {
  context: GenerateVMContext;
  instanceTypeData: VMWizardFormValues['instanceTypeData'];
  vmData: VMWizardFormValues['vmData'];
};

export type GenerateVMCallback = (props: GenerateVMArgs) => V1VirtualMachine;

export type VMGenerationSource = {
  autoUpdateEnabled?: boolean;
  cluster: string;
  customDiskSize: string;
  defaultSSHSecretName?: string;
  driversImage?: string;
  dvSource: VMWizardFormValues['instanceTypeData']['dvSource'];
  enableMultiArchBootImageImport?: boolean;
  isIPv6SingleStack?: boolean;
  isUDNManagedNamespace: boolean;
  name: VMWizardFormValues['vmData']['name'];
  preference: VMWizardFormValues['instanceTypeData']['preference'];
  project: string;
  pvcSource: VMWizardFormValues['instanceTypeData']['pvcSource'];
  selectedBootableVolume: VMWizardFormValues['instanceTypeData']['selectedBootableVolume'];
  selectedInstanceType: VMWizardFormValues['instanceTypeData']['selectedInstanceType'];
  subscriptionData: RHELAutomaticSubscriptionData;
  useBootSource: VMWizardFormValues['instanceTypeData']['useBootSource'];
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

export type GetVMGenerationSourceArgs = {
  autoUpdateEnabled?: boolean;
  cluster: string;
  defaultSSHSecretName?: string;
  driversImage?: string;
  enableMultiArchBootImageImport?: boolean;
  instanceTypeData: VMWizardFormValues['instanceTypeData'];
  isIPv6SingleStack?: boolean;
  isUDNManagedNamespace: boolean;
  name: VMWizardFormValues['vmData']['name'];
  project: string;
  subscriptionData: RHELAutomaticSubscriptionData;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
};

export type GenerateVMSpecConfiguration = {
  context: Omit<GenerateVMContext, 'sshSecretName'>;
  instanceTypeData: VMWizardFormValues['instanceTypeData'];
};

export type GenerateVMSpecTemplateConfiguration = {
  enableMultiArchBootImageImport?: boolean;
  hasBootVolume: boolean;
  isIPv6SingleStack?: boolean;
  isIso: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  selectedBootableVolume: BootableVolume | null;
  selectedPreference?: string;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
  vmName: string;
  volumeName: string;
};

export type GenerateVMSpecDataVolumeTemplates = {
  customDiskSize: string | undefined;
  dvSource: VMWizardFormValues['instanceTypeData']['dvSource'];
  isIso: boolean;
  pvcSource: VMWizardFormValues['instanceTypeData']['pvcSource'];
  selectedBootableVolume: BootableVolume;
  storageClassName: string;
  vmName: string;
  volumeName: string;
};
