import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

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
  sshSecretName?: string;
  targetNamespace: string;
  vmDescription?: string;
  vmName?: string;
};

export type GenerateVMCallback = (props: GenerateVMArgs) => V1VirtualMachine;

export type GenerateVMSpecConfiguration = {
  selectedBootableVolume: BootableVolume;
  dvSource: VMWizardFormValues['instanceTypeData']['dvSource'];
  pvcSource: VMWizardFormValues['instanceTypeData']['pvcSource'];
  customDiskSize: string;
  vmName: string;
  selectedInstanceType: VMWizardFormValues['instanceTypeData']['selectedInstanceType'];
  enableMultiArchBootImageImport: boolean;
  isIPv6SingleStack: boolean;
  populatedCloudInitYAML: string;
  isUDNManagedNamespace: boolean;
};

export type GenerateVMSpecTemplateConfiguration = {
  isUDNManagedNamespace: boolean;
  enableMultiArchBootImageImport: boolean;
  isIPv6SingleStack: boolean;
  isIso: boolean;
  vmName: string;
  populatedCloudInitYAML: string;
  volumeName: string;
  selectedPreference: string;
  selectedBootableVolume: BootableVolume;
};

export type GenerateVMSpecDataVolumeTemplates = {
  volumeName: string;
  selectedBootableVolume: BootableVolume;
  dvSource: Parameters<GenerateVMCallback>[0]['dvSource'];
  pvcSource: Parameters<GenerateVMCallback>[0]['pvcSource'];
  customDiskSize: string | undefined;
  isIso: boolean;
  storageClassName: string;
  vmName: string;
};
