import { useEffect, useMemo, useState } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';

type UseMigrationNamespacesPVCs = (
  vms: V1VirtualMachine[],
) => [IoK8sApiCoreV1PersistentVolumeClaim[], boolean, any];

const useMigrationNamespacesPVCs: UseMigrationNamespacesPVCs = (vms) => {
  const [pvcs, setPVCs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[]>([]);
  const [pvcsLoaded, setPVCsLoaded] = useState<boolean>(false);
  const [listError, setListError] = useState<Error | null>(null);
  const cluster = getCluster(vms?.[0]);

  const uniqueNamespaces = useMemo(() => new Set(vms?.map((vm) => getNamespace(vm))), [vms]);
  const memoizedNamespaces = useDeepCompareMemoize(Array.from(uniqueNamespaces));

  useEffect(() => {
    Promise.all(
      memoizedNamespaces?.map((ns) =>
        kubevirtK8sListItems<IoK8sApiCoreV1PersistentVolumeClaim>({
          cluster,
          model: PersistentVolumeClaimModel,
          queryParams: { ns },
        }),
      ),
    )
      .then((results) => {
        setPVCs(results.flat());
        setPVCsLoaded(true);
      })
      .catch((err) => {
        setListError(err);
        setPVCsLoaded(false);
      });
  }, [memoizedNamespaces, cluster]);

  return [pvcs, pvcsLoaded, listError];
};

export default useMigrationNamespacesPVCs;
