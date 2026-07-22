import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

type GenerateVMArgs = {
  cluster?: string;
  customDiskSize: string;
  dvSource: V1beta1DataVolume;
  enableMultiArchBootImageImport?: boolean;
  folder: string;
  isIPv6SingleStack?: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: string };
  targetNamespace: string;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
  vmDescription?: string;
  vmName?: string;
};

export type GenerateVMCallback = (props: GenerateVMArgs) => V1VirtualMachine;

export type GenerateVMSpecConfiguration = {
  customDiskSize: string;
  dvSource: VMWizardFormValues['instanceTypeData']['dvSource'];
  enableMultiArchBootImageImport: boolean;
  isIPv6SingleStack: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  pvcSource: VMWizardFormValues['instanceTypeData']['pvcSource'];
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: VMWizardFormValues['instanceTypeData']['selectedInstanceType'];
  vmCreationNad?: NetworkAttachmentDefinitionKind;
  vmName: string;
};

export type GenerateVMSpecTemplateConfiguration = {
  enableMultiArchBootImageImport: boolean;
  isIPv6SingleStack: boolean;
  isIso: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  selectedBootableVolume: BootableVolume;
  selectedPreference: string;
  vmCreationNad?: NetworkAttachmentDefinitionKind;
  vmName: string;
  volumeName: string;
};

export type GenerateVMSpecDataVolumeTemplates = {
  customDiskSize: string | undefined;
  dvSource: Parameters<GenerateVMCallback>[0]['dvSource'];
  isIso: boolean;
  pvcSource: Parameters<GenerateVMCallback>[0]['pvcSource'];
  selectedBootableVolume: BootableVolume;
  storageClassName: string;
  vmName: string;
  volumeName: string;
};
