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
  configMaps: IoK8sApiCoreV1ConfigMap[];
  error: any;
  loaded: boolean;
  secrets: IoK8sApiCoreV1Secret[];
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const useEnvironmentsResources = (namespace: string): UseEnvironmentsResourcesType => {
  const [secrets, secretsLoaded, secretsError] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [configMaps, configMapsLoaded, configMapsError] = useK8sWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [serviceAccounts, serviceAccountsLoaded, serviceAccountsError] = useK8sWatchResource<
    IoK8sApiCoreV1ServiceAccount[]
  >({
    groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  return {
    configMaps,
    error: secretsError || configMapsError || serviceAccountsError,
    loaded: serviceAccountsLoaded && configMapsLoaded && secretsLoaded,
    secrets,
    serviceAccounts,
  };
};

export default useEnvironmentsResources;
