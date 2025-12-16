import React, { FC, ReactNode } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import useCheckupsDetailsPageHistoryColumns from './hooks/useCheckupsDetailsPageHistoryColumns';
import CheckupsDetailsPageHistoryRow from './CheckupsDetailsPageHistoryRow';

type CheckupsDetailsPageHistoryProps = {
  customActions?: (job: IoK8sApiBatchV1Job) => ReactNode;
  error: Error | null | undefined;
  jobs: IoK8sApiBatchV1Job[];
  loaded: boolean;
  sortColumnIndex?: number;
  sortDirection?: SortByDirection.asc | SortByDirection.desc;
};

const CheckupsDetailsPageHistory: FC<CheckupsDetailsPageHistoryProps> = ({
  customActions,
  error,
  jobs,
  loaded,
  sortColumnIndex,
  sortDirection,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useCheckupsDetailsPageHistoryColumns();

  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('History')}
      </Title>
      <VirtualizedTable<IoK8sApiBatchV1Job>
        NoDataEmptyMsg={() => (
          <Bullseye>
            <div>{t('No data available')}</div>
          </Bullseye>
        )}
        columns={columns}
        data={jobs}
        loaded={loaded}
        loadError={error || undefined}
        Row={CheckupsDetailsPageHistoryRow}
        rowData={{ customActions }}
        unfilteredData={jobs}
        {...(typeof sortColumnIndex === 'number' ? { sortColumnIndex } : {})}
        {...(sortDirection ? { sortDirection } : {})}
      />
    </>
  );
};

export default CheckupsDetailsPageHistory;
