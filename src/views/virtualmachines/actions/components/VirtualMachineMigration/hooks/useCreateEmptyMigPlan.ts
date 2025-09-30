import { useEffect, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { getEmptyMigPlan } from '../utils/migrateVMs';

const useCreateEmptyMigPlan = (
  namespaces: string[],
  cluster?: string,
): [migPlan: MigPlan, loaded: boolean, error: Error | null] => {
  const [migPlan, setMigPlan] = useState<MigPlan>(null);
  const [error, setError] = useState<Error | null>();
  const memoizedNamespaces = useDeepCompareMemoize(namespaces);

  useEffect(() => {
    const emptyMigPlan = getEmptyMigPlan(memoizedNamespaces);

    kubevirtK8sCreate({
      cluster,
      data: emptyMigPlan,
      model: MigPlanModel,
    })
      .then((createdMigPlan) => {
        setMigPlan(createdMigPlan);
      })
      .catch(setError);
  }, [memoizedNamespaces, cluster]);

  return [migPlan, !isEmpty(migPlan), error];
};

export default useCreateEmptyMigPlan;
