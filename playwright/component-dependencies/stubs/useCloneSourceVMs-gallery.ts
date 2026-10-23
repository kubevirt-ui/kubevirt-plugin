/**
 * Gallery alias for `useCloneSourceVMs` on the wizard clone step.
 * Watches VMs in the deployment namespace only (no fleet search or PVC/VMI mappers).
 */
import { useWatch } from 'react-hook-form';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import type { PVCMapper, VMIMapper, VMIMMapper } from '@virtualmachines/utils/mappers';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

const emptyMapper = { mapper: {}, nodeNames: {} } as VMIMapper;

/** Gallery: namespaced VM watch only (avoids fleet search / mapper stack on clone step). */
export const useCloneSourceVMs = () => {
  const { control } = useVMWizardForm();
  const [cluster, targetNamespace] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project'],
  });

  const [vms, vmsLoaded, vmsLoadError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    targetNamespace
      ? {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace: targetNamespace,
          namespaced: true,
        }
      : null,
  );

  return {
    cluster,
    filterDefinitions: [] as KubevirtFilter<V1VirtualMachine>[],
    loadingFeatureProxy: false,
    pvcMapper: emptyMapper as PVCMapper,
    targetNamespace,
    vmiMapper: emptyMapper,
    vmimMapper: emptyMapper as unknown as VMIMMapper,
    vmimsLoaded: true,
    vmisLoaded: true,
    vms: vms ?? [],
    vmsLoaded: Boolean(targetNamespace) && vmsLoaded,
    vmsLoadError: vmsLoadError as Error,
  };
};
