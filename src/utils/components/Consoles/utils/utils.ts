import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const isConnectionEncrypted = () => window.location.protocol === 'https:';

export const getCloudInitCredentials = (
  vmi: V1VirtualMachineInstance,
): { user: string; password: string } => {
  const cloudInitValuesStrings = vmi?.spec?.volumes
    ?.find((volume) => volume?.cloudInitNoCloud)
    ?.cloudInitNoCloud?.userData?.split('\n')
    ?.filter((row) => !row?.includes('#cloud-config'));

  const password = cloudInitValuesStrings
    ?.find((row) => row?.includes('password'))
    ?.split(': ')?.[1];

  const user = cloudInitValuesStrings?.find((row) => row?.includes('user'))?.split(': ')?.[1];

  return { user, password };
};
