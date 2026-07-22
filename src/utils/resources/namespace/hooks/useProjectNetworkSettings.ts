import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getProjectNetworkSettings, type ProjectNetworkSettings } from '../selectors';

type UseProjectNetworkSettingsArgs = {
  cluster?: string;
  namespaceName?: string;
};

type UseProjectNetworkSettingsReturn = ProjectNetworkSettings & {
  error: unknown;
  loaded: boolean;
};

const useProjectNetworkSettings = ({
  cluster,
  namespaceName,
}: UseProjectNetworkSettingsArgs): UseProjectNetworkSettingsReturn => {
  const [namespace, loaded, error] = useK8sWatchData<K8sResourceCommon>(
    namespaceName
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(NamespaceModel),
          name: namespaceName,
        }
      : null,
  );

  const { defaultNadName, isPodNetworkAllowed } = getProjectNetworkSettings(namespace);

  return {
    defaultNadName,
    error,
    isPodNetworkAllowed,
    loaded,
  };
};

export default useProjectNetworkSettings;
