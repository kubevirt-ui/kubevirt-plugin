import {
  ConfigMapModel,
  modelToGroupVersionKind,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1Secret,
  IoK8sApiCoreV1ServiceAccount,
} from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseEnvironmentsResourcesType = {
  secrets: IoK8sApiCoreV1Secret[];
  configMaps: IoK8sApiCoreV1ConfigMap[];
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
  loaded: boolean;
  error: any;
};

const useEnvironmentsResources = (namespace: string): UseEnvironmentsResourcesType => {
  const [secrets, secretsLoaded, secretsError] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    namespaced: true,
    isList: true,
    namespace,
  });

  const [configMaps, configMapsLoaded, configMapsError] = useK8sWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    namespaced: true,
    isList: true,
    namespace,
  });

  const [serviceAccounts, serviceAccountsLoaded, serviceAccountsError] = useK8sWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >({
    groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
    namespaced: true,
    isList: true,
    namespace,
  });

  return {
    secrets,
    configMaps,
    serviceAccounts,
    loaded: serviceAccountsLoaded && configMapsLoaded && secretsLoaded,
    error: secretsError || configMapsError || serviceAccountsError,
  };
};

export default useEnvironmentsResources;
