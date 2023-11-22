import { load } from 'js-yaml';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { CLOUD_INIT_MISSING_USERNAME } from '@kubevirt-utils/components/Consoles/utils/constants';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type CloudinitUserDataObject = {
  passwd?: { users: { name: string }[] };
  password?: string;
  user?: string;
};

export const getCloudInitCredentials = (
  vm: V1VirtualMachine,
): { users: { name?: string; password?: string }[] } => {
  const cloudInitVolume = getCloudInitVolume(vm);
  const cloudInitData = getCloudInitData(cloudInitVolume);

  try {
    const userDataObject: CloudinitUserDataObject = load(cloudInitData?.userData);

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
    kubevirtConsole.error(e);
  }

  return { users: [] };
};
