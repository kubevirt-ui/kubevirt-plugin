import React, { FC, useMemo } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';
import { PendingIcon } from '@patternfly/react-icons';

import StatusCountItem, { getLinkProps } from '../shared/StatusCountItem';
import ViewAllLink from '../shared/ViewAllLink';

import useStorageMigrationNavigation from './useStorageMigrationNavigation';
import useStorageMigrationOverviewData from './useStorageMigrationOverviewData';
import { getStorageMigrationStatusCounts } from './utils';

import './StorageMigrationPlansWidget.scss';

type StorageMigrationPlansWidgetProps = {
  cluster?: string;
};

const StorageMigrationPlansWidget: FC<StorageMigrationPlansWidgetProps> = ({ cluster }) => {
  const { t } = useKubevirtTranslation();
  const { loaded, loadError, storageMigPlans } = useStorageMigrationOverviewData(cluster);
  const { basePath, isExternal, pendingUrl, runningUrl } = useStorageMigrationNavigation(cluster);

  const statusCounts = useMemo(
    () => getStorageMigrationStatusCounts(storageMigPlans),
    [storageMigPlans],
  );

  return (
    <Card
      className="storage-migration-plans-widget"
      data-test="storage-migration-plans-widget"
      isCompact
    >
      <CardHeader
        actions={{
          actions: <ViewAllLink {...getLinkProps(basePath, isExternal)} />,
          hasNoOffset: false,
        }}
      >
        <CardTitle>{t('Storage migration plans')}</CardTitle>
      </CardHeader>
      <CardBody className="storage-migration-plans-widget__body">
        {loadError ? (
          <ErrorAlert error={loadError} />
        ) : (
          <Grid className="storage-migration-plans-widget__body-grid" hasGutter>
            <StatusCountItem
              {...getLinkProps(runningUrl, isExternal)}
              count={statusCounts.running}
              icon={<vmStatusIcon.Running />}
              isLoading={!loaded}
              label={t('Running')}
              span={3}
            />
            <StatusCountItem
              {...getLinkProps(pendingUrl, isExternal)}
              count={statusCounts.pending}
              icon={<PendingIcon />}
              isLoading={!loaded}
              label={t('Pending')}
              span={3}
            />
          </Grid>
        )}
      </CardBody>
    </Card>
  );
};

export default StorageMigrationPlansWidget;
