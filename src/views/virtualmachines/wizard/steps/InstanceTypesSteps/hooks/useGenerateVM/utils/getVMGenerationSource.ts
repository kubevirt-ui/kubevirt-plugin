import {
  type GetVMGenerationSourceArgs,
  type VMGenerationSource,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';

export const getVMGenerationSource = ({
  autoUpdateEnabled,
  cluster,
  defaultSSHSecretName,
  driversImage,
  enableMultiArchBootImageImport,
  instanceTypeData,
  isIPv6SingleStack,
  isUDNManagedNamespace,
  name,
  project,
  subscriptionData,
  vmCreationNad,
}: GetVMGenerationSourceArgs): VMGenerationSource => {
  const {
    customDiskSize,
    dvSource,
    preference,
    pvcSource,
    selectedBootableVolume,
    selectedInstanceType,
    useBootSource,
  } = instanceTypeData;

  return {
    autoUpdateEnabled,
    cluster,
    customDiskSize,
    defaultSSHSecretName,
    driversImage,
    dvSource,
    enableMultiArchBootImageImport,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    name,
    preference,
    project,
    pvcSource,
    selectedBootableVolume,
    selectedInstanceType,
    subscriptionData,
    useBootSource,
    vmCreationNad,
  };
};
