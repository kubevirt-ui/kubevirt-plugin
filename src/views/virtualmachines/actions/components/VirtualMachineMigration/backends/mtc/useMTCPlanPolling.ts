import { useCallback, useEffect, useState } from 'react';

import { MigMigrationModel, MigPlanModel } from '@kubevirt-utils/models';
import {
  MigMigration,
  MigPlan,
  MTC_MIGRATION_NAMESPACE,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import {
  mergeMTCMigMigrationStatusIntoPlan,
  pickLatestMigMigrationForPlan,
} from '@kubevirt-utils/resources/migrations/mtc';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet, kubevirtK8sListItems } from '@multicluster/k8sRequests';

import {
  MIGRATION_PLAN_POLL_BACKOFF_FACTOR,
  MIGRATION_PLAN_POLL_BACKOFF_MAX_MS,
  MIGRATION_PLAN_POLL_INTERVAL_MS,
} from '../../hooks/migrationPlanPollingConstants';

/**
 * Refreshes MTC progress by GETting the MigPlan (when available), LISTing MigMigrations, and merging
 * the latest migration into the normalized plan shape for shared progress UI.
 */
const useMTCPlanPolling = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan | null,
): [MultiNamespaceVirtualMachineStorageMigrationPlan | null, boolean, Error | undefined] => {
  const [data, setData] = useState<MultiNamespaceVirtualMachineStorageMigrationPlan | null>(() =>
    plan ? mergeMTCMigMigrationStatusIntoPlan(plan, undefined, undefined) : null,
  );
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const fetchProgress = useCallback(
    async (stopped: boolean) => {
      if (!plan) return undefined;

      try {
        const clusterId = getCluster(plan);
        const planName = getName(plan);

        let rawMigPlan: MigPlan | undefined;
        try {
          rawMigPlan = await kubevirtK8sGet<MigPlan>({
            cluster: clusterId,
            model: MigPlanModel,
            name: planName,
            ns: MTC_MIGRATION_NAMESPACE,
          });
        } catch {
          rawMigPlan = undefined;
        }

        const migrations = await kubevirtK8sListItems<MigMigration>({
          cluster: clusterId,
          model: MigMigrationModel,
          queryParams: { ns: MTC_MIGRATION_NAMESPACE },
        });

        if (stopped) return undefined;

        const latest = pickLatestMigMigrationForPlan(migrations, planName);
        const merged = mergeMTCMigMigrationStatusIntoPlan(plan, latest, rawMigPlan);
        setData(merged);
        setError(undefined);
        setLoaded(true);
        return merged;
      } catch (err) {
        if (stopped) return undefined;

        setError(err instanceof Error ? err : new Error(String(err)));
        setLoaded(true);
        return undefined;
      }
    },
    [plan],
  );

  useEffect(() => {
    if (!plan) return;

    setData(mergeMTCMigMigrationStatusIntoPlan(plan, undefined, undefined));

    let stopped = false;
    let timerId: ReturnType<typeof setTimeout>;
    let nextDelayMs = MIGRATION_PLAN_POLL_INTERVAL_MS;

    const poll = async () => {
      const result = await fetchProgress(stopped);
      if (stopped) return;

      if (result && isMigrationCompleted(result)) return;

      const hasFailed = (result?.status?.namespaces ?? []).some(
        (ns) => (ns?.[STORAGE_MIGRATION_PHASE.FAILED] ?? []).length > 0,
      );
      if (hasFailed) return;

      if (result) {
        nextDelayMs = MIGRATION_PLAN_POLL_INTERVAL_MS;
      } else {
        nextDelayMs = Math.min(
          MIGRATION_PLAN_POLL_BACKOFF_MAX_MS,
          nextDelayMs * MIGRATION_PLAN_POLL_BACKOFF_FACTOR,
        );
      }

      timerId = setTimeout(poll, nextDelayMs);
    };

    poll();

    return () => {
      stopped = true;
      clearTimeout(timerId);
    };
  }, [plan, fetchProgress]);

  return [data, loaded, error];
};

export default useMTCPlanPolling;
