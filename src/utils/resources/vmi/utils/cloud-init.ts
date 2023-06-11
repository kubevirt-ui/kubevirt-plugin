import { load } from 'js-yaml';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CLOUD_INIT_MISSING_USERNAME } from '@kubevirt-utils/components/Consoles/utils/constants';

type CloudinitUserDataObject = {
  passwd?: { users: { name: string }[] };
  password?: string;
  user?: string;
};

export const getCloudInitCredentials = (
  vm: V1VirtualMachine,
): { users: { name?: string; password?: string }[] } => {
  const cloudInitVolume = vm?.spec?.template?.spec?.volumes?.find(
    (volume) => volume?.cloudInitNoCloud || volume?.cloudInitConfigDrive,
  );
  const cloudInitDataSource =
    cloudInitVolume?.cloudInitNoCloud || cloudInitVolume?.cloudInitConfigDrive;

  try {
    const userDataObject: CloudinitUserDataObject = load(cloudInitDataSource?.userData);

    if (userDataObject?.user || userDataObject?.password) {
      return {
        users: [
          {
            name: userDataObject?.user || CLOUD_INIT_MISSING_USERNAME,
            password: userDataObject?.password,
          },
        ],
      };
    }

    if (userDataObject?.passwd?.users) {
      return {
        users: userDataObject?.passwd?.users?.map((userobject) => {
          return { name: userobject?.name || CLOUD_INIT_MISSING_USERNAME };
        }),
      };
    }
  } catch (e) {
    console.error(e);
  }

  return { users: [] };
};
