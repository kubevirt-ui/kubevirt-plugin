import {
  modelToGroupVersionKind,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  type StorageMigrationAPI,
  MigPlan,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_API,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import useK8sListData from '@multicluster/hooks/useK8sListData';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useClusterStorageMigrationApiProbe from '@virtualmachines/actions/hooks/storageMigrationApi/useClusterStorageMigrationApiProbe';

import { useKubeVirtOverviewClusterCsv } from '../../context/KubeVirtOverviewClusterCsvContext';

type UseStorageMigrationOverviewData = (cluster?: string) => {
  csvVersion: string | undefined;
  loaded: boolean;
  loadError: unknown;
  storageMigAPI: StorageMigrationAPI;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

/**
 * Storage migration plans for the cluster overview card.
 * Uses `useK8sWatchData` for MULTI_NS and `useK8sListData` for SINGLE_NS / MTC.
 * CSV for ACM discovery is supplied by `KubeVirtOverviewClusterCsvProvider`.
 */
const useStorageMigrationOverviewData: UseStorageMigrationOverviewData = (cluster) => {
  const { installedCSV, loaded: csvLoaded } = useKubeVirtOverviewClusterCsv();
  const csvVersion = installedCSV?.spec?.version;
  const storageMigAPI = useClusterStorageMigrationApiProbe(cluster, {
    installedCSV,
    loaded: csvLoaded,
  });

  const backend = getStorageMigrationBackend(storageMigAPI);

  const isMultiNs = storageMigAPI === STORAGE_MIGRATION_API.MULTI_NS;

  const [multiNsPlans, multiNsLoaded, multiNsError] = useK8sWatchData<
    MultiNamespaceVirtualMachineStorageMigrationPlan[]
  >(
    isMultiNs && backend
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(backend.planModel),
          isList: true,
          namespaced: !backend.overviewUsesClusterScopedPlanWatch,
        }
      : null,
  );

  const [singleNsPlans, singleNsLoaded, singleNsError] = useK8sWatchData<
    VirtualMachineStorageMigrationPlan[]
  >(
    isMultiNs
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel),
          isList: true,
          namespaced: false,
        }
      : null,
  );

  const [singleNsOnlyPlans, singleNsOnlyLoaded, singleNsOnlyError] =
    useK8sListData<VirtualMachineStorageMigrationPlan>(
      storageMigAPI === STORAGE_MIGRATION_API.SINGLE_NS && backend
        ? {
            cluster,
            model: backend.planModel,
          }
        : null,
    );

  const [mtcPlans, mtcLoaded, mtcError] = useK8sListData<MigPlan>(
    storageMigAPI === STORAGE_MIGRATION_API.MTC && backend
      ? {
          cluster,
          model: backend.planModel,
          namespace: backend.fixedPlanNamespace,
        }
      : null,
  );

  if (storageMigAPI === STORAGE_MIGRATION_API.LOADING) {
    return {
      csvVersion,
      loaded: false,
      loadError: undefined,
      storageMigAPI: STORAGE_MIGRATION_API.LOADING,
      storageMigPlans: [],
    };
  }

  if (storageMigAPI === STORAGE_MIGRATION_API.NONE) {
    return {
      csvVersion,
      loaded: true,
      loadError: undefined,
      storageMigAPI: STORAGE_MIGRATION_API.NONE,
      storageMigPlans: [],
    };
  }

  if (storageMigAPI === STORAGE_MIGRATION_API.MTC && backend) {
    return {
      csvVersion,
      loaded: mtcLoaded,
      loadError: mtcError,
      storageMigAPI: STORAGE_MIGRATION_API.MTC,
      storageMigPlans: (mtcPlans ?? [])
        .map((p) => backend.normalizePlanForOverview(p))
        .filter(Boolean),
    };
  }

  if (storageMigAPI === STORAGE_MIGRATION_API.SINGLE_NS && backend) {
    return {
      csvVersion,
      loaded: singleNsOnlyLoaded,
      loadError: singleNsOnlyError,
      storageMigAPI: STORAGE_MIGRATION_API.SINGLE_NS,
      storageMigPlans: (singleNsOnlyPlans ?? [])
        .map((p) => backend.normalizePlanForOverview(p))
        .filter(Boolean),
    };
  }

  return {
    csvVersion,
    loaded: multiNsLoaded && singleNsLoaded,
    loadError: multiNsError ?? singleNsError,
    storageMigAPI: STORAGE_MIGRATION_API.MULTI_NS,
    storageMigPlans: [
      ...(multiNsPlans ?? []).map((p) => backend?.normalizePlanForOverview(p)).filter(Boolean),
      ...(singleNsPlans ?? []).map((p) => normalizeSingleNsPlan(p)).filter(Boolean),
    ],
  };
};

export default useStorageMigrationOverviewData;
