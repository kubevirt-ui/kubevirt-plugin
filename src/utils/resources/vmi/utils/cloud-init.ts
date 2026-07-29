import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { CLOUD_INIT_MISSING_USERNAME } from '@kubevirt-utils/components/Consoles/utils/constants';
import { safeYAMLToJS } from '@kubevirt-utils/utils/yaml';

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
  const userDataObject = safeYAMLToJS<CloudinitUserDataObject | undefined>(
    cloudInitData?.userData,
    undefined,
  );

  if (userDataObject?.user || userDataObject?.password) {
    return {
      users: [
        {
          name: userDataObject?.user || CLOUD_INIT_MISSING_USERNAME,
          password: userDataObject?.password?.toString(),
        },
      ],
    };
  }

  if (userDataObject?.passwd?.users) {
    return {
      users: userDataObject.passwd.users.map((userobject) => {
        return { name: userobject?.name || CLOUD_INIT_MISSING_USERNAME };
      }),
    };
  }

  return { users: [] };
};
