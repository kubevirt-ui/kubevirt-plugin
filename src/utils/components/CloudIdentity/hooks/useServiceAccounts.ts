import {
  modelToGroupVersionKind,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseServiceAccountsResult = {
  canCreate: boolean;
  canRead: boolean;
  error: Error | undefined;
  loaded: boolean;
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const useServiceAccounts = (namespace: string, cluster?: string): UseServiceAccountsResult => {
  const [canRead, listPermissionLoading] = useFleetAccessReview({
    cluster,
    group: ServiceAccountModel.apiGroup,
    namespace,
    resource: ServiceAccountModel.plural,
    verb: 'list',
  });

  const canCreate = useCanCreateResource({ cluster, model: ServiceAccountModel, namespace });

  const [watchedServiceAccounts, watchLoaded, watchError] = useK8sWatchData<
    IoK8sApiCoreV1ServiceAccount[]
  >(
    canRead
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(ServiceAccountModel),
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  return {
    canCreate,
    canRead,
    error: watchError,
    loaded: !listPermissionLoading && (!canRead || watchLoaded),
    serviceAccounts: watchedServiceAccounts ?? [],
  };
};

export default useServiceAccounts;
