import { VirtualMachineInstanceMigrationModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

const useVirtualMachineInstanceMigrations = (cluster?: string, namespace?: string) =>
  useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>({
    cluster,
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

export default useVirtualMachineInstanceMigrations;
