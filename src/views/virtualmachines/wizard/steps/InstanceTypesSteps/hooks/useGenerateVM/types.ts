import { type UseFormGetValues } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { type UseApplyAutoLabelsResult } from '@virtualmachines/wizard/hooks/useApplyAutoLabels';
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
  autoAppliedLabels: UseApplyAutoLabelsResult;
  context: GenerateVMContext;
  deployment: VMWizardFormValues['deployment'];
  getValues: UseFormGetValues<VMWizardFormValues>;
  instanceType: VMWizardFormValues['instanceType'];
};

export type GenerateVMCallback = (props: GenerateVMArgs) => V1VirtualMachine;

export type GenerateVMSpecConfiguration = {
  context: Omit<GenerateVMContext, 'sshSecretName'>;
  instanceType: VMWizardFormValues['instanceType'];
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
  dvSource: NonNullable<VMWizardFormValues['instanceType']['bootVolume']>['dataVolumeSource'];
  isIso: boolean;
  pvcSource: NonNullable<
    VMWizardFormValues['instanceType']['bootVolume']
  >['persistentVolumeClaimSource'];
  selectedBootableVolume: BootableVolume;
  storageClassName: string;
  vmName: string;
  volumeName: string;
};
