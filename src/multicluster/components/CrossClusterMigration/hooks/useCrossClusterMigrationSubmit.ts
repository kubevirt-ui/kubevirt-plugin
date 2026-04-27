import { useCallback, useRef, useState } from 'react';
import { Updater } from 'use-immer';

import {
  MigrationModel,
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

import { MTV_MIGRATION_NAMESPACE } from '../constants';

import { cleanupPartialResources, getCreateMigration } from './utils';

const useCrossClusterMigrationSubmit = (
  migrationPlan: V1beta1Plan,
  setMigrationPlan: Updater<V1beta1Plan>,
  storageMap: V1beta1StorageMap,
  networkMap: V1beta1NetworkMap,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref guard prevents duplicate submissions from rapid/concurrent clicks
  // before the React state update re-render can disable the button.
  const isSubmittingRef = useRef(false);

  const onSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    let createdStorageMap: undefined | V1beta1StorageMap;
    let createdNetworkMap: undefined | V1beta1NetworkMap;
    let createdMigrationPlan: undefined | V1beta1Plan;

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

      createdStorageMap = await kubevirtK8sCreate({
        data: finalStorageMap,
        model: StorageMapModel,
      });
      createdNetworkMap = await kubevirtK8sCreate({
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

      createdMigrationPlan = await kubevirtK8sCreate({
        data: finalMigrationPlan,
        model: PlanModel,
        ns: MTV_MIGRATION_NAMESPACE,
      });

      await kubevirtK8sCreate({
        data: getCreateMigration(createdMigrationPlan),
        model: MigrationModel,
        ns: MTV_MIGRATION_NAMESPACE,
      });
      setMigrationPlan(createdMigrationPlan);
      setSuccess(true);
    } catch (apiError) {
      cleanupPartialResources({ createdMigrationPlan, createdNetworkMap, createdStorageMap });
      setError(apiError);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
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
