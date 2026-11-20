import { NamespaceModel } from '@kubevirt-utils/models';
import {
  getProjectNetworkSettings,
  type ProjectNetworkSettings,
} from '@kubevirt-utils/resources/namespace/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type FetchProjectNetworkSettingsArgs = {
  cluster?: string;
  namespaceName: string;
};

export const fetchProjectNetworkSettings = async ({
  cluster,
  namespaceName,
}: FetchProjectNetworkSettingsArgs): Promise<ProjectNetworkSettings> => {
  const namespace = await kubevirtK8sGet<K8sResourceCommon>({
    cluster,
    model: NamespaceModel,
    name: namespaceName,
  });

  return getProjectNetworkSettings(namespace);
};
