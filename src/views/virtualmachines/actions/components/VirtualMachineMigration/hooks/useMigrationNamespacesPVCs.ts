import { useEffect, useMemo, useState } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';

type UseMigrationNamespacesPVCs = (
  vms: V1VirtualMachine[],
) => [IoK8sApiCoreV1PersistentVolumeClaim[], boolean, Error | null];

const useMigrationNamespacesPVCs: UseMigrationNamespacesPVCs = (vms) => {
  const [pvcs, setPvcs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[]>([]);
  const [pvcsLoaded, setPvcsLoaded] = useState<boolean>(false);
  const [listError, setListError] = useState<Error | null>(null);
  const cluster = getCluster(vms?.[0]);

  const uniqueNamespaces = useMemo(() => new Set(vms?.map((vm) => getNamespace(vm))), [vms]);
  const memoizedNamespaces = useDeepCompareMemoize(Array.from(uniqueNamespaces));

  useEffect(() => {
    Promise.all(
      memoizedNamespaces?.map((namespace) =>
        kubevirtK8sListItems<IoK8sApiCoreV1PersistentVolumeClaim>({
          cluster,
          model: PersistentVolumeClaimModel,
          queryParams: { ns: namespace },
        }),
      ),
    )
      .then((results) => {
        setPvcs(results.flat());
        setPvcsLoaded(true);
      })
      .catch((err) => {
        setListError(err);
        setPvcsLoaded(false);
      });
  }, [memoizedNamespaces, cluster]);

  return [pvcs, pvcsLoaded, listError];
};

export default useMigrationNamespacesPVCs;
