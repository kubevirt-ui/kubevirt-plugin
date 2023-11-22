import React, { FC } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Title } from '@patternfly/react-core';

import useCheckupsNetworkDetailsPageHistoryColumns from './network/details/hooks/useCheckupsNetworkDetailsPageHistoryColumns';
import CheckupsNetworkDetailsPageHistoryRow from './CheckupsDetailsPageHistoryRow';

type CheckupsNetworkDetailsPageHistoryProps = {
  error: Error;
  jobs: IoK8sApiBatchV1Job[];
  loading: boolean;
};

const CheckupsNetworkDetailsPageHistory: FC<CheckupsNetworkDetailsPageHistoryProps> = ({
  error,
  jobs,
  loading,
}) => {
  const { t } = useKubevirtTranslation();
  const columns = useCheckupsNetworkDetailsPageHistoryColumns();

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
        loaded={loading}
        loadError={error}
        Row={CheckupsNetworkDetailsPageHistoryRow}
        rowData={jobs}
        unfilteredData={jobs}
      />
    </>
  );
};

export default CheckupsNetworkDetailsPageHistory;
