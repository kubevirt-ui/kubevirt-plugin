import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

type GenerateVMArgs = {
  cluster?: string;
  customDiskSize: string;
  dvSource: V1beta1DataVolume;
  enableMultiArchBootImageImport?: boolean;
  folder: string;
  generatedVMName: string;
  isIPv6SingleStack?: boolean;
  isUDNManagedNamespace: boolean;
  populatedCloudInitYAML: string;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  selectedBootableVolume: BootableVolume;
  selectedInstanceType: { name: string; namespace: string };
  targetNamespace: string;
};

export type GenerateVMCallback = (props: GenerateVMArgs) => V1VirtualMachine;
