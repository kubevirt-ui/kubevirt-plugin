import { useCallback, useState } from 'react';
import { Updater } from 'use-immer';

import {
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { getName, getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

const useCrossClusterMigrationSubmit = (
  migrationPlan: V1beta1Plan,
  setMigrationPlan: Updater<V1beta1Plan>,
  storageMap: V1beta1StorageMap,
  networkMap: V1beta1NetworkMap,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const finalStorageMap = {
        ...storageMap,
        metadata: {
          ...storageMap.metadata,
          name: `${getName(migrationPlan)}-${getRandomChars()}`,
        },
        spec: {
          ...storageMap.spec,
          provider: migrationPlan.spec.provider,
        },
      };

      const finalNetworkMap = {
        ...networkMap,
        metadata: {
          ...networkMap.metadata,
          name: `${getName(migrationPlan)}-${getRandomChars()}`,
        },
        spec: {
          ...networkMap.spec,
          provider: migrationPlan.spec.provider,
        },
      };

      const createdStorageMap = await kubevirtK8sCreate({
        data: finalStorageMap,
        model: StorageMapModel,
      });
      const createdNetworkMap = await kubevirtK8sCreate({
        data: finalNetworkMap,
        model: NetworkMapModel,
      });

      const finalMigrationPlan: V1beta1Plan = {
        ...migrationPlan,
        metadata: {
          ...migrationPlan.metadata,
          name: `cross-cluster-migration-${getRandomChars()}`,
        },
        spec: {
          ...migrationPlan.spec,
          map: {
            network: {
              apiVersion: networkMap.apiVersion,
              kind: networkMap.kind,
              name: getName(createdNetworkMap),
              namespace: getNamespace(createdNetworkMap),
              uid: getUID(createdNetworkMap),
            },
            storage: {
              apiVersion: storageMap.apiVersion,
              kind: storageMap.kind,
              name: getName(createdStorageMap),
              namespace: getNamespace(createdStorageMap),
              uid: getUID(createdStorageMap),
            },
          },
        },
      };

      const createdMigrationPlan = await kubevirtK8sCreate({
        data: finalMigrationPlan,
        model: PlanModel,
      });

      setMigrationPlan(createdMigrationPlan);
      setSuccess(true);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }, [storageMap, migrationPlan, networkMap, setMigrationPlan]);

  return {
    error,
    isSubmitting,
    onSubmit,
    success,
  };
};

export default useCrossClusterMigrationSubmit;
