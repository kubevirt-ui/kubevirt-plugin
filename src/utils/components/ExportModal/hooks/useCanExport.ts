import { SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { PodModel, RoleBindingModel, RoleModel, ServiceAccountModel } from '@kubevirt-utils/models';

const useCanExport = (cluster: string, namespace: string): boolean => {
  const canCreatePod = useCanCreateResource({ cluster, model: PodModel, namespace });
  const canCreateSecret = useCanCreateResource({ cluster, model: SecretModel, namespace });
  const canCreateServiceAccount = useCanCreateResource({
    cluster,
    model: ServiceAccountModel,
    namespace,
  });
  const canCreateRole = useCanCreateResource({ cluster, model: RoleModel, namespace });
  const canCreateRoleBinding = useCanCreateResource({
    cluster,
    model: RoleBindingModel,
    namespace,
  });

  return Boolean(
    namespace &&
    canCreatePod &&
    canCreateSecret &&
    canCreateServiceAccount &&
    canCreateRole &&
    canCreateRoleBinding,
  );
};

export default useCanExport;
