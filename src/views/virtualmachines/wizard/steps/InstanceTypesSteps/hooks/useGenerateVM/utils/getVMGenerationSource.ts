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

export type VMGenerationSource = Readonly<
  Omit<GetVMGenerationSourceArgs, 'instanceTypeData' | 'vmData'> & {
    deployment: Pick<
      VMWizardFormValues['deployment'],
      'cluster' | 'description' | 'folder' | 'name' | 'project'
    >;
    instanceType: Pick<
      VMWizardFormValues['instanceType'],
      'bootVolume' | 'compute' | 'operatingSystem' | 'preference' | 'useBootSource'
    >;
  }
>;

export const getVMGenerationSource = ({
  autoUpdateEnabled,
  context,
  driversImage,
  instanceTypeData,
  subscriptionData,
  vmData,
}: GetVMGenerationSourceArgs): VMGenerationSource => ({
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
