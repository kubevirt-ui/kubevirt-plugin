import { useEffect, useState } from 'react';

import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { getEmptyMigPlan } from '../utils/migrateVMs';

const useCreateEmptyMigPlan = (
  namespace: string,
): [migPlan: MigPlan, loaded: boolean, error: Error | null] => {
  const [migPlan, setMigPlan] = useState<MigPlan>(null);
  const [error, setError] = useState<Error | null>();

  useEffect(() => {
    const emptyMigPlan = getEmptyMigPlan(namespace);

    k8sCreate({
      data: emptyMigPlan,
      model: MigPlanModel,
    })
      .then((createdMigPlan) => {
        setMigPlan(createdMigPlan);
      })
      .catch(setError);
  }, [namespace]);

  return [migPlan, !isEmpty(migPlan), error];
};

export default useCreateEmptyMigPlan;
