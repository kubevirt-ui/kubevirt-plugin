import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';

const useVirtualMachineInstanceMigrations = (
  cluster?: string,
  namespace?: string,
): readonly [V1VirtualMachineInstanceMigration[], boolean, unknown] => {
  const { loaded, loadError, resources } =
    useAccessibleResources<V1VirtualMachineInstanceMigration>({
      clusters: cluster ? [cluster] : undefined,
      groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
      namespace,
    });

  return [resources, loaded, loadError] as const;
};

export default useVirtualMachineInstanceMigrations;
