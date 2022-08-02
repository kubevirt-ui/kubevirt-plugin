import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { load } from 'js-yaml';

type CloudinitUserDataObject = {
  user?: string;
  password?: string;
  passwd?: { users: { name: string; password: string }[] };
};

export const getCloudInitCredentials = (
  vmi: V1VirtualMachineInstance,
): { user: string; password: string } => {
  const cloudInitVolume = vmi?.spec?.volumes?.find(
    (volume) => volume?.cloudInitNoCloud || volume?.cloudInitConfigDrive,
  );

  const cloudInit = cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  try {
    const cloudinitObject: CloudinitUserDataObject = load(cloudInit?.userData);

    if (cloudinitObject?.user || cloudinitObject?.password) {
      return {
        user: cloudinitObject?.user,
        password: cloudinitObject?.password,
      };
    }

    if (cloudinitObject?.passwd?.users) {
      return {
        user: cloudinitObject?.passwd?.users?.[0]?.name,
        password: cloudinitObject?.passwd?.users?.[0]?.password,
      };
    }
  } catch (e) {
    console.log(e?.message);
  }
  return { user: null, password: null };
};
