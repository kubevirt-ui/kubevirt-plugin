import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';

import { type GenerateVMContext } from '../types';

type GetVMGenerationSourceArgs = {
  autoUpdateEnabled?: boolean;
  context: Omit<GenerateVMContext, 'populatedCloudInitYAML' | 'vmName'>;
  driversImage?: string;
  instanceTypeData: VMWizardFormValues['instanceType'];
  subscriptionData: unknown;
  vmData: VMWizardFormValues['deployment'];
};

export const getVMGenerationSource = ({
  autoUpdateEnabled,
  context,
  driversImage,
  instanceTypeData,
  subscriptionData,
  vmData,
}: GetVMGenerationSourceArgs): Readonly<Record<string, unknown>> => ({
  autoUpdateEnabled,
  context,
  deployment: {
    cluster: vmData.cluster,
    description: vmData.description,
    folder: vmData.folder,
    name: vmData.name,
    project: vmData.project,
  },
  driversImage,
  instanceType: {
    bootVolume: instanceTypeData.bootVolume,
    compute: instanceTypeData.compute,
    operatingSystem: instanceTypeData.operatingSystem,
    preference: instanceTypeData.preference,
    useBootSource: instanceTypeData.useBootSource,
  },
  subscriptionData,
});
