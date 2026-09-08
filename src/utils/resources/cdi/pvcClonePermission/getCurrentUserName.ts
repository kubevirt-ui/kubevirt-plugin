import { UserModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

export const getCurrentUserName = async (cluster?: string): Promise<string | undefined> => {
  try {
    const user = await kubevirtK8sGet({ cluster, model: UserModel, name: '~' });
    return getName(user);
  } catch (error) {
    kubevirtConsole.warn('Failed to resolve current user for CDI clone RoleBinding', error);
    return undefined;
  }
};
