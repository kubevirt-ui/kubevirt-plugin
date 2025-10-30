import React, { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  NamespaceModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet, ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsStatusIcon from '../../CheckupsStatusIcon';
import { STATUS_START_TIME_STAMP } from '../../utils/utils';
import CheckupsSelfValidationActions from '../components/CheckupsSelfValidationActions';
import {
  formatStatusTimestamp,
  getResultsConfigMapName,
  getSummaryText,
  parseResults,
  TOTAL_TESTS_FAILED_KEY,
  TOTAL_TESTS_PASSED_KEY,
  TOTAL_TESTS_RUN_KEY,
  TOTAL_TESTS_SKIPPED_KEY,
} from '../utils';

interface CheckupsSelfValidationRowData {
  getJobByName: (configMapName: string, exactMatch: boolean) => IoK8sApiBatchV1Job[];
}

type CheckupsSelfValidationListRowProps = RowProps<
  IoK8sApiCoreV1ConfigMap,
  CheckupsSelfValidationRowData
>;

const CheckupsSelfValidationListRow: FC<CheckupsSelfValidationListRowProps> = ({
  activeColumnIDs,
  obj: configMap,
  rowData: { getJobByName },
}) => {
  const { t } = useKubevirtTranslation();
  const jobs = getJobByName(configMap?.metadata?.name, false);
  const job = jobs?.[0];
  const [resultsConfigMap, setResultsConfigMap] = useState<IoK8sApiCoreV1ConfigMap | null>(null);

  const isJobCompleted = job?.status?.succeeded === 1 || job?.status?.failed === 1;

  // Fetch results ConfigMap when job is completed
  useEffect(() => {
    if (!isJobCompleted || !job?.metadata?.name || !job?.metadata?.namespace) {
      setResultsConfigMap(null);
      return;
    }

    const fetchResults = async () => {
      try {
        const resultsConfigMapName = getResultsConfigMapName(job.metadata.name);
        const fetchedConfigMap = await k8sGet({
          model: ConfigMapModel,
          name: resultsConfigMapName,
          ns: job.metadata.namespace,
        });
        setResultsConfigMap(fetchedConfigMap as IoK8sApiCoreV1ConfigMap);
      } catch (error) {
        kubevirtConsole.warn('Could not fetch results ConfigMap:', error);
        setResultsConfigMap(null);
      }
    };

    fetchResults();
  }, [isJobCompleted, job?.metadata?.name, job?.metadata?.namespace]);

  const formattedStartTime = useMemo(
    () =>
      formatStatusTimestamp(
        job?.status?.startTime || configMap?.data?.[STATUS_START_TIME_STAMP],
        t,
        NO_DATA_DASH,
      ),
    [job?.status?.startTime, configMap?.data, t],
  );

  const formattedCompletionTime = useMemo(
    () => formatStatusTimestamp(job?.status?.completionTime, t, NO_DATA_DASH),
    [job?.status?.completionTime, t],
  );

  const summaryText = useMemo(() => {
    // If job is completed, get summary from results ConfigMap
    if (isJobCompleted && resultsConfigMap) {
      const results = parseResults(resultsConfigMap);
      if (results?.summary) {
        const total = Number(results.summary[TOTAL_TESTS_RUN_KEY]) || 0;
        const passed = Number(results.summary[TOTAL_TESTS_PASSED_KEY]) || 0;
        const failed = Number(results.summary[TOTAL_TESTS_FAILED_KEY]) || 0;
        const skipped = Number(results.summary[TOTAL_TESTS_SKIPPED_KEY]) || 0;

        return `${passed}/${total} passed (${failed} failed, ${skipped} skipped)`;
      }
    }

    // Otherwise, get summary from job annotations (for running jobs)
    return getSummaryText(job, NO_DATA_DASH);
  }, [isJobCompleted, resultsConfigMap, job]);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <Link
          to={createURL(
            `self-validation/${configMap?.metadata?.name}`,
            `/k8s/ns/${configMap?.metadata?.namespace}/checkups`,
          )}
        >
          {configMap?.metadata?.name}
        </Link>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={configMap?.metadata?.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <CheckupsStatusIcon configMap={configMap} job={job} onlyJob={true} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="startTime">
        {formattedStartTime}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="completionTime">
        {formattedCompletionTime}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="summary">
        {summaryText}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <CheckupsSelfValidationActions configMap={configMap} isKebab jobs={jobs} />
      </TableData>
    </>
  );
};

export default CheckupsSelfValidationListRow;
