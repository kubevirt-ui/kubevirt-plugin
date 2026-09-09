import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

const useVirtualMachineInstanceMigrations = (
  cluster?: string,
  namespace?: string,
): readonly [V1VirtualMachineInstanceMigration[], boolean, unknown] => {
  const [namespacedVMIMs, namespacedVMIMsLoaded, namespacedVMIMsLoadError] =
    useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>(
      namespace
        ? {
            cluster,
            groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
            isList: true,
            limit: OBJECTS_FETCHING_LIMIT,
            namespace,
            namespaced: true,
          }
        : null,
    );

  const {
    loaded: accessibleVMIMsLoaded,
    loadError: accessibleVMIMsError,
    resources: accessibleVMIMs,
  } = useAccessibleResources<V1VirtualMachineInstanceMigration>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
  });

  const vmims = namespace ? namespacedVMIMs : accessibleVMIMs;
  const loaded = namespace ? namespacedVMIMsLoaded : accessibleVMIMsLoaded;
  const loadError = namespace ? namespacedVMIMsLoadError : accessibleVMIMsError;

  return [vmims || [], loaded, loadError] as const;
};

export default useVirtualMachineInstanceMigrations;
