import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getCloudInitCredentials = (
  vmi: V1VirtualMachineInstance,
): { user: string; password: string } => {
  const cloudInitVolume = vmi?.spec?.volumes?.find(
    (volume) => volume?.cloudInitNoCloud || volume?.cloudInitConfigDrive,
  );

  const cloudInit = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  const cloudInitValuesStrings = cloudInit?.userData
    ?.split('\n')
    ?.filter((row) => !row?.includes('#cloud-config'));

  const password = cloudInitValuesStrings
    ?.find((row) => row?.includes('password'))
    ?.split(': ')?.[1];

  const user = cloudInitValuesStrings?.find((row) => row?.includes('user'))?.split(': ')?.[1];

  return { user, password };
};
