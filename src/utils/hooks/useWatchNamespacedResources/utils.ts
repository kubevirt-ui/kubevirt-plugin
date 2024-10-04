import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { WatchNamespacedResources } from './constants';

export const createWatchNamespacedResources = (
  watchResources: null | WatchK8sResource,
  projects: K8sResourceCommon[],
  isAdmin: boolean,
): WatchNamespacedResources => {
  if (isEmpty(watchResources)) return;

  if (isEmpty(watchResources?.namespace) && !isAdmin)
    return projects.reduce((acc, project) => {
      const projectName = getName(project);
      acc[projectName] = { ...watchResources, namespace: projectName };
      return acc;
    }, {} as WatchNamespacedResources);

  return { [watchResources?.namespace]: watchResources };
};
