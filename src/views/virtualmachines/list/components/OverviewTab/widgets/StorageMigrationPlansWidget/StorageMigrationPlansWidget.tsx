import React, { FC, useMemo } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';
import { PendingIcon } from '@patternfly/react-icons';

import StatusCountItem from '../shared/StatusCountItem';
import ViewAllLink from '../shared/ViewAllLink';

import useStorageMigrationOverviewData from './useStorageMigrationOverviewData';
import { getStorageMigrationStatusCounts } from './utils';

import './StorageMigrationPlansWidget.scss';

type StorageMigrationPlansWidgetProps = {
  cluster?: string;
  onViewAll?: () => void;
};

const StorageMigrationPlansWidget: FC<StorageMigrationPlansWidgetProps> = ({
  cluster,
  onViewAll,
}) => {
  const { t } = useKubevirtTranslation();
  const { loaded, loadError, storageMigPlans } = useStorageMigrationOverviewData(cluster);

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
      {/* TODO CNV-78882: pass onViewAll once storage migrations navigation is implemented */}
      <CardHeader
        actions={
          onViewAll
            ? {
                actions: <ViewAllLink onClick={onViewAll} />,
                hasNoOffset: false,
              }
            : undefined
        }
      >
        <CardTitle>{t('Storage migration plans')}</CardTitle>
      </CardHeader>
      <CardBody className="storage-migration-plans-widget__body">
        {loadError ? (
          <ErrorAlert error={loadError} />
        ) : (
          <Grid className="storage-migration-plans-widget__body-grid" hasGutter>
            <StatusCountItem
              count={statusCounts.running}
              icon={<vmStatusIcon.Running />}
              isLoading={!loaded}
              label={t('Running')}
              span={3}
            />
            <StatusCountItem
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
