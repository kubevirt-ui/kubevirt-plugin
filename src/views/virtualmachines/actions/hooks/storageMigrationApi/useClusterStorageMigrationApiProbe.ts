import { useEffect, useMemo, useRef, useState } from 'react';

import type { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import {
  type StorageMigrationAPI,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  type StorageMigrationProbeFallbackPhase,
  csvLoadedIndicatesMultiNsStorageMigrationApi,
  csvMinorMeetsMultiNsAssumeThreshold,
  parseKubeVirtCsvMinorVersion,
  STORAGE_MIGRATION_CSV_WAIT_AFTER_MULTI_NS_404_MS,
  STORAGE_MIGRATION_PROBE_PHASE_IDLE,
  STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404,
} from './constants';
import {
  onMultiNamespaceStorageMigration404,
  probeMtcThenSingleNsOrNone,
  probeMultiNamespaceStorageMigrationApi,
} from './probeEffects';

export type StorageMigrationProbeCsv = Pick<
  ReturnType<typeof useKubevirtClusterServiceVersion>,
  'installedCSV' | 'loaded'
>;

/**
 * ACM-only LIST probe + CSV-aware fallback (shared by VM actions and overview widget).
 * Single-cluster console assumes the multi-namespace storage migration API (MULTI_NS) — no probe.
 * CSV metadata must come from the caller — overview passes shared context to avoid duplicate watches.
 * When CSV is loaded and OpenShift Virtualization minor is 21+, resolves MULTI_NS immediately (no LIST probe).
 */
const useClusterStorageMigrationApiProbe = (
  cluster: string | undefined,
  csv: StorageMigrationProbeCsv,
): StorageMigrationAPI => {
  const isACMPage = useIsACMPage();
  const [result, setResult] = useState<StorageMigrationAPI>(() =>
    isACMPage ? STORAGE_MIGRATION_API.LOADING : STORAGE_MIGRATION_API.MULTI_NS,
  );
  const phaseRef = useRef<StorageMigrationProbeFallbackPhase>(STORAGE_MIGRATION_PROBE_PHASE_IDLE);
  const resolvedRef = useRef<{ api: StorageMigrationAPI; cluster?: string } | null>(null);

  const [, hubClusterLoaded, hubClusterError] = useHubClusterName();
  const { installedCSV, loaded: csvLoaded } = csv;

  // Hub name must be ready before probing a named managed cluster on ACM; single-cluster skips probe.
  const probeAllowed = isACMPage && (!cluster || hubClusterLoaded || hubClusterError != null);
  const csvMinor = useMemo(
    () => parseKubeVirtCsvMinorVersion(installedCSV?.spec?.version),
    [installedCSV?.spec?.version],
  );

  useEffect(() => {
    phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
    resolvedRef.current = null;
  }, [cluster]);

  useEffect(() => {
    if (!isACMPage) {
      phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
      resolvedRef.current = null;
      setResult(STORAGE_MIGRATION_API.MULTI_NS);
      return;
    }
    phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
    resolvedRef.current = null;
    setResult(STORAGE_MIGRATION_API.LOADING);
  }, [isACMPage]);

  useEffect(() => {
    if (!probeAllowed) {
      return undefined;
    }

    const resolvedSnapshot = resolvedRef.current;
    const reuseResolved =
      resolvedSnapshot != null &&
      resolvedSnapshot.cluster === cluster &&
      resolvedSnapshot.api !== STORAGE_MIGRATION_API.LOADING &&
      phaseRef.current !== STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404;

    if (reuseResolved) {
      setResult(resolvedSnapshot.api);
      return undefined;
    }

    let canceled = false;
    let csvWaitTimer: ReturnType<typeof setTimeout> | undefined;

    const clearCsvWaitTimer = () => {
      if (csvWaitTimer !== undefined) {
        clearTimeout(csvWaitTimer);
        csvWaitTimer = undefined;
      }
    };

    const finish = (api: StorageMigrationAPI) => {
      if (canceled) return;
      phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
      clearCsvWaitTimer();
      resolvedRef.current = { api, cluster };
      setResult(api);
    };

    const canceledFn = () => canceled;

    if (
      phaseRef.current === STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404 &&
      csvLoaded
    ) {
      phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
      clearCsvWaitTimer();
      if (csvMinorMeetsMultiNsAssumeThreshold(csvMinor)) {
        finish(STORAGE_MIGRATION_API.MULTI_NS);
      } else {
        probeMtcThenSingleNsOrNone(cluster, canceledFn, finish);
      }
      return () => {
        canceled = true;
        clearCsvWaitTimer();
      };
    }

    if (
      phaseRef.current === STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404 &&
      !csvLoaded
    ) {
      return () => {
        canceled = true;
        clearCsvWaitTimer();
      };
    }

    // Fast-path: on 4.21+ the multi-namespace API is the canonical model —
    // resolve immediately without a LIST probe when CSV is already loaded.
    if (csvLoadedIndicatesMultiNsStorageMigrationApi(csvLoaded, csvMinor)) {
      finish(STORAGE_MIGRATION_API.MULTI_NS);
      return () => {
        canceled = true;
      };
    }

    setResult(STORAGE_MIGRATION_API.LOADING);
    phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;

    probeMultiNamespaceStorageMigrationApi(cluster, canceledFn, finish, () =>
      onMultiNamespaceStorageMigration404({
        canceled: canceledFn,
        cluster,
        csvLoaded,
        csvMinor,
        finish,
        phaseRef,
        scheduleDelayedProbe: (run: () => void) => {
          csvWaitTimer = setTimeout(run, STORAGE_MIGRATION_CSV_WAIT_AFTER_MULTI_NS_404_MS);
        },
      }),
    );

    return () => {
      canceled = true;
      clearCsvWaitTimer();
    };
  }, [cluster, csvLoaded, csvMinor, probeAllowed]);

  return result;
};

export default useClusterStorageMigrationApiProbe;
