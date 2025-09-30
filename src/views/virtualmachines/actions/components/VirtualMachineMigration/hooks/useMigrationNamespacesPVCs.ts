import { useEffect, useState } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { fleetK8sList } from '@stolostron/multicluster-sdk';

type UseMigrationNamespacesPVCs = (
  namespaces: string[],
) => [IoK8sApiCoreV1PersistentVolumeClaim[], boolean, any];

const useMigrationNamespacesPVCs: UseMigrationNamespacesPVCs = (namespaces) => {
  const [pvcs, setPVCs] = useState<IoK8sApiCoreV1PersistentVolumeClaim[]>([]);
  const [pvcsLoaded, setPVCsLoaded] = useState<boolean>(false);
  const [listError, setListError] = useState<Error | null>(null);
  const memoizedNamespaces = useDeepCompareMemoize(namespaces);

  useEffect(() => {
    Promise.all(
      memoizedNamespaces?.map((ns) =>
        fleetK8sList<IoK8sApiCoreV1PersistentVolumeClaim>({
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
  }, [memoizedNamespaces]);

  const pvcsInNamespaces = pvcs?.filter((pvc) => namespaces.includes(getNamespace(pvc)));

  return [pvcsInNamespaces, pvcsLoaded, listError];
};

export default useMigrationNamespacesPVCs;
