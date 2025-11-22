import { useMemo } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable, SortByDirection } from '@patternfly/react-table';

import {
  CheckupsStatus,
  columnsSorting,
  CONFIGMAP_NAME,
  getConfigMapStatus,
  getJobContainers,
  getJobStatus,
  STATUS_START_TIME_STAMP,
} from '../../../utils/utils';

const useCheckupsSelfValidationListColumns = (
  jobs: IoK8sApiBatchV1Job[],
): [TableColumn<IoK8sApiCoreV1ConfigMap>[], TableColumn<IoK8sApiCoreV1ConfigMap>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const jobsByConfigMapName = useMemo(() => {
    const map = new Map<string, IoK8sApiBatchV1Job[]>();
    for (const job of jobs) {
      const configMapName = getJobContainers(job)?.[0]?.env?.find(
        (env) => env.name === CONFIGMAP_NAME,
      )?.value;
      if (configMapName) {
        // Strip -<number>-results suffix to get the base name
        const baseName = configMapName.replace(/-\d+-results$/, '');
        if (!map.has(baseName)) {
          map.set(baseName, []);
        }
        map.get(baseName).push(job);
      }
    }
    // Sort each job array by creation time (newest first)
    for (const jobList of map.values()) {
      jobList.sort(
        (a, b) =>
          new Date(b.metadata.creationTimestamp).getTime() -
          new Date(a.metadata.creationTimestamp).getTime(),
      );
    }
    return map;
  }, [jobs]);

  const columns: TableColumn<IoK8sApiCoreV1ConfigMap>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'namespace',
        sort: 'metadata.namespace',
        title: t('Namespace'),
        transforms: [sortable],
      },
      {
        id: 'status',
        sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) => {
          const statusOrder = {
            [CheckupsStatus.Done]: 2,
            [CheckupsStatus.Failed]: 3,
            [CheckupsStatus.Pending]: 4,
            [CheckupsStatus.Running]: 1,
          };

          return data.toSorted((a, b) => {
            const jobA = jobsByConfigMapName.get(a?.metadata?.name)?.[0];
            const jobB = jobsByConfigMapName.get(b?.metadata?.name)?.[0];
            const statusA = getConfigMapStatus(a, getJobStatus(jobA));
            const statusB = getConfigMapStatus(b, getJobStatus(jobB));

            const orderA = statusOrder[statusA] || 999;
            const orderB = statusOrder[statusB] || 999;

            return sortDirection === SortByDirection.asc ? orderA - orderB : orderB - orderA;
          });
        },
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'startTime',
        sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) =>
          columnsSorting(data, sortDirection, STATUS_START_TIME_STAMP),
        title: t('Start time'),
        transforms: [sortable],
      },
      {
        id: 'completionTime',
        sort: (data: IoK8sApiCoreV1ConfigMap[], sortDirection: SortByDirection) => {
          return data.toSorted((a, b) => {
            const jobA = jobsByConfigMapName.get(a?.metadata?.name)?.[0];
            const jobB = jobsByConfigMapName.get(b?.metadata?.name)?.[0];
            const completionTimeA = jobA?.status?.completionTime;
            const completionTimeB = jobB?.status?.completionTime;

            // Handle cases where completion time doesn't exist (still running)
            if (!completionTimeA && !completionTimeB) return 0;
            if (!completionTimeA) return sortDirection === SortByDirection.asc ? 1 : -1;
            if (!completionTimeB) return sortDirection === SortByDirection.asc ? -1 : 1;

            const timeA = new Date(completionTimeA).getTime();
            const timeB = new Date(completionTimeB).getTime();

            return sortDirection === SortByDirection.asc ? timeA - timeB : timeB - timeA;
          });
        },
        title: t('Completion time'),
        transforms: [sortable],
      },
      {
        id: 'summary',
        title: t('Summary'),
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [t, jobsByConfigMapName],
  );

  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<IoK8sApiCoreV1ConfigMap>({
      columnManagementID: 'checkups-self-validation',
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useCheckupsSelfValidationListColumns;
