import { load } from 'js-yaml';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CLOUD_INIT_MISSING_USERNAME } from '@kubevirt-utils/components/Consoles/utils/constants';

type CloudinitUserDataObject = {
  user?: string;
  password?: string;
  passwd?: { users: { name: string }[] };
};

export const getCloudInitCredentials = (
  vmi: V1VirtualMachineInstance,
): { users: { name?: string; password?: string }[] } => {
  const cloudInitVolume = vmi?.spec?.volumes?.find(
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
