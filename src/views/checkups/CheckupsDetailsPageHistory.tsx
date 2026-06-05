import React, { FC, ReactNode, useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { TableToolbarActionsFlex } from '@kubevirt-utils/components/TableToolbarActions/TableToolbarActionsFlex';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { Title } from '@patternfly/react-core';

import {
  CheckupsHistoryCallbacks,
  getCheckupsHistoryColumns,
  getCheckupsHistoryRowId,
} from './checkupsDetailsPageHistoryDefinition';

import './CheckupsDetailsPageHistory.scss';

type CheckupsDetailsPageHistoryProps = {
  checkupName: string | undefined;
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
  error: Error | null | undefined;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  jobs: IoK8sApiBatchV1Job[];
  loaded: boolean;
};

const CheckupsDetailsPageHistory: FC<CheckupsDetailsPageHistoryProps> = ({
  checkupName,
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

  const exportButton = (
    <KubevirtTableExport
      exportKey={
        checkupName
          ? `${checkupName}-${EXPORT_TABLE_KEYS.CHECKUPS_HISTORY}`
          : EXPORT_TABLE_KEYS.CHECKUPS_HISTORY
      }
      asToolbarItem={false}
      callbacks={callbacks}
      columns={columns}
      data={jobs}
      initialSortDirection={initialSortDirection}
      initialSortKey={initialSortKey}
      loaded={loaded}
    />
  );

  return (
    <>
      <div className="checkups-details-page-history__heading">
        <Title headingLevel="h2">{t('History')}</Title>
        <TableToolbarActionsFlex>{exportButton}</TableToolbarActionsFlex>
      </div>
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
