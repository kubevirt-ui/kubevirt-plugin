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
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseEnvironmentsResourcesType = {
  configMaps: IoK8sApiCoreV1ConfigMap[];
  error: any;
  loaded: boolean;
  secrets: IoK8sApiCoreV1Secret[];
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const useEnvironmentsResources = (namespace: string): UseEnvironmentsResourcesType => {
  const cluster = useClusterParam();
  const [secrets, secretsLoaded, secretsError] = useK8sWatchData<IoK8sApiCoreV1Secret[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [configMaps, configMapsLoaded, configMapsError] = useK8sWatchData<
    IoK8sApiCoreV1ConfigMap[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [serviceAccounts, serviceAccountsLoaded, serviceAccountsError] = useK8sWatchData<
    IoK8sApiCoreV1ServiceAccount[]
  >({
    cluster,
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
