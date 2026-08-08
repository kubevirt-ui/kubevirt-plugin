import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

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
