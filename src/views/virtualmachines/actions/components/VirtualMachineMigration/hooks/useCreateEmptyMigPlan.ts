import { useEffect, useState } from 'react';

import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { getEmptyMigPlan } from '../utils/migrateVMs';

const useCreateEmptyMigPlan = (
  namespace: string,
  cluster?: string,
): [migPlan: MigPlan, loaded: boolean, error: Error | null] => {
  const [migPlan, setMigPlan] = useState<MigPlan>(null);
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    const emptyMigPlan = getEmptyMigPlan(namespace);

    kubevirtK8sCreate({
      cluster,
      data: emptyMigPlan,
      model: MigPlanModel,
    })
      .then((createdMigPlan) => {
        setMigPlan(createdMigPlan);
      })
      .catch(setError);
  }, [namespace, cluster]);

  return [migPlan, !isEmpty(migPlan), error];
};

export default useCreateEmptyMigPlan;
