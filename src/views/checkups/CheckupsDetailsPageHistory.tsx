import React, { FC, ReactNode, useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import {
  CheckupsHistoryCallbacks,
  getCheckupsHistoryColumns,
  getCheckupsHistoryRowId,
} from './checkupsDetailsPageHistoryDefinition';

type CheckupsDetailsPageHistoryProps = {
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
  error: Error | null | undefined;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  jobs: IoK8sApiBatchV1Job[];
  loaded: boolean;
};

const CheckupsDetailsPageHistory: FC<CheckupsDetailsPageHistoryProps> = ({
  customActions,
  error,
  initialSortDirection,
  initialSortKey,
  jobs,
  loaded,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useMemo(() => getCheckupsHistoryColumns(t), [t]);

  const callbacks: CheckupsHistoryCallbacks = useMemo(() => ({ customActions }), [customActions]);

  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('History')}
      </Title>
      <KubevirtTable
        ariaLabel={t('Checkups history table')}
        callbacks={callbacks}
        columns={columns}
        data={jobs}
        dataTest="checkups-history-table"
        getRowId={getCheckupsHistoryRowId}
        initialSortDirection={initialSortDirection}
        initialSortKey={initialSortKey}
        loaded={loaded}
        loadError={error}
        noDataMsg={t('No checkup runs yet')}
        unfilteredData={jobs}
      />
    </>
  );
};

export default CheckupsDetailsPageHistory;
