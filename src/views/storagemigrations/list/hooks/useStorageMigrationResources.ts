import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsMTCInstalled from '@virtualmachines/actions/hooks/useIsMTCInstalled';

const adaptMigPlanToVmsmp = (
  migPlan: MigPlan,
): MultiNamespaceVirtualMachineStorageMigrationPlan => {
  const persistentVolumes = migPlan.spec?.persistentVolumes || [];

  const nsMap: Record<string, string[]> = {};
  for (const pv of persistentVolumes) {
    const nsName = pv.pvc?.namespace;
    if (nsName) {
      if (!nsMap[nsName]) nsMap[nsName] = [];
      nsMap[nsName].push(pv.pvc.name);
    }
  }

  const namespaces = Object.entries(nsMap).map(([nsName, pvcNames]) => ({
    name: nsName,
    virtualMachines: pvcNames.map((pvcName) => ({
      name: pvcName,
      targetMigrationPVCs: persistentVolumes
        .filter((pv) => pv.pvc?.namespace === nsName && pv.pvc?.name === pvcName)
        .map((pv) => ({
          destinationPVC: {
            name: pv.pvc.name,
            storageClassName: pv.selection?.storageClass,
          },
          sourcePVC: { name: pv.pvc.name },
        })),
    })),
  }));

  return {
    ...migPlan,
    spec: { namespaces },
    status: { namespaces: [] },
  } as unknown as MultiNamespaceVirtualMachineStorageMigrationPlan;
};

type UseStorageMigrationResources = () => {
  loaded: boolean;
  loadError: any;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

const useStorageMigrationResources: UseStorageMigrationResources = () => {
  const namespace = useNamespaceParam();
  const mtcInstalled = useIsMTCInstalled();

  const [vmsmpPlans, vmsmpLoaded, vmsmpError] = useK8sWatchData<
    MultiNamespaceVirtualMachineStorageMigrationPlan[]
  >({
    groupVersionKind: modelToGroupVersionKind(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    ),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [migPlans, migPlansLoaded, migPlansError] = useK8sWatchData<MigPlan[]>({
    groupVersionKind: modelToGroupVersionKind(MigPlanModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
  });

  if (mtcInstalled) {
    const adaptedPlans = (migPlans || []).map(adaptMigPlanToVmsmp);
    const filteredPlans = namespace
      ? adaptedPlans.filter((plan) => plan.spec?.namespaces?.some((ns) => ns.name === namespace))
      : adaptedPlans;

    return {
      loaded: migPlansLoaded,
      loadError: migPlansError,
      storageMigPlans: filteredPlans,
    };
  }

  return {
    loaded: vmsmpLoaded,
    loadError: vmsmpError,
    storageMigPlans: vmsmpPlans,
  };
};

export default useStorageMigrationResources;
