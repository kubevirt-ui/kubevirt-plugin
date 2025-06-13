import { useEffect, useState } from 'react';

import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { getEmptyMigPlan } from '../utils/migrateVMs';

const useCreateEmptyMigPlan = (namespace: string) => {
  const [migPlan, setMigPlan] = useState<MigPlan>(null);

  useEffect(() => {
    const emptyMigPlan = getEmptyMigPlan(namespace);

    k8sCreate({
      data: emptyMigPlan,
      model: MigPlanModel,
    }).then((createdMigPlan) => {
      setMigPlan(createdMigPlan);
    });
  }, [namespace]);

  return migPlan;
};

export default useCreateEmptyMigPlan;
