import { useWatch } from 'react-hook-form';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import useVMMetrics from '@virtualmachines/list/hooks/useVMMetrics';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import { PVCMapper, VMIMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

import { resolveVMListSource } from '../utils/utils';

import { useCloneSourceVMFilters } from './useCloneSourceVMFilters';

type UseCloneSourceVMsReturn = {
  cluster: string;
  loadingFeatureProxy: boolean;
  pvcMapper: PVCMapper;
  rowFilters: RowFilter<V1VirtualMachine>[];
  targetNamespace: string;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
  vmimsLoaded: boolean;
  vmisLoaded: boolean;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
  vmsLoadError: Error;
};

export const useCloneSourceVMs = (): UseCloneSourceVMsReturn => {
  useSignals();
  useVMMetrics();

  const { control } = useVMWizard();
  const [cluster, targetNamespace] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER, CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT],
  });

  const { loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const searchQueries = useVMSearchQueries();

  const [namespacedVMs, namespacedVMsLoaded, loadError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
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
    VM_FILTER_OPTIONS,
    searchQueries?.vmQueries,
  );

  const {
    loaded: accessibleVMsLoaded,
    loadError: accessibleVMsError,
    resources: accessibleVMs,
  } = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });

  const {
    loaded: vmsLoaded,
    loadError: vmsLoadError,
    vms,
  } = resolveVMListSource(
    targetNamespace,
    { loaded: namespacedVMsLoaded, loadError, vms: namespacedVMs },
    { loaded: accessibleVMsLoaded, loadError: accessibleVMsError, vms: accessibleVMs },
  );

  const [vmims, vmimsLoaded] = useVirtualMachineInstanceMigrations(cluster, targetNamespace);
  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();
  const virtualMachineInstanceMigrationMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(targetNamespace, cluster);

  const { rowFilters } = useCloneSourceVMFilters(vms, vmiMapper, pvcMapper);

  return {
    cluster,
    loadingFeatureProxy,
    pvcMapper,
    rowFilters,
    targetNamespace,
    vmiMapper,
    vmimMapper: virtualMachineInstanceMigrationMapper,
    vmimsLoaded,
    vmisLoaded,
    vms,
    vmsLoaded,
    vmsLoadError,
  };
};
