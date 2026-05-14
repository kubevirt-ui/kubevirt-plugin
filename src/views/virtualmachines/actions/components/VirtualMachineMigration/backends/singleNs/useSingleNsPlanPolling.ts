import { useCallback, useEffect, useState } from 'react';

import { VirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import {
  MIGRATION_PLAN_POLL_BACKOFF_FACTOR,
  MIGRATION_PLAN_POLL_BACKOFF_MAX_MS,
  MIGRATION_PLAN_POLL_INTERVAL_MS,
} from '../../hooks/migrationPlanPollingConstants';

/**
 * Polls a VirtualMachineStorageMigrationPlan (single-namespace KubeVirt API) on a spoke cluster via
 * kubevirtK8sGet (bypasses useK8sModel). Stops when the migration completes, fails, or the component
 * unmounts. On fetch errors, backs off and retries until a successful fetch or unmount.
 */
const useSingleNsPlanPolling = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan | null,
): [MultiNamespaceVirtualMachineStorageMigrationPlan | null, boolean, Error | undefined] => {
  const [data, setData] = useState<MultiNamespaceVirtualMachineStorageMigrationPlan | null>(
    () => plan ?? null,
  );
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const fetchPlan = useCallback(
    async (stopped: boolean) => {
      if (!plan) return undefined;

      try {
        const raw = await kubevirtK8sGet<VirtualMachineStorageMigrationPlan>({
          cluster: getCluster(plan),
          model: VirtualMachineStorageMigrationPlanModel,
          name: getName(plan),
          ns: getNamespace(plan),
        });

        if (stopped) return undefined;

        const normalized = normalizeSingleNsPlan(raw);
        setData(normalized);
        setError(undefined);
        setLoaded(true);
        return normalized;
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

    setData(plan);
    setLoaded(false);
    setError(undefined);

    let stopped = false;
    let timerId: ReturnType<typeof setTimeout>;
    let nextDelayMs = MIGRATION_PLAN_POLL_INTERVAL_MS;

    const poll = async () => {
      const result = await fetchPlan(stopped);
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
  }, [plan, fetchPlan]);

  return [data, loaded, error];
};

export default useSingleNsPlanPolling;
