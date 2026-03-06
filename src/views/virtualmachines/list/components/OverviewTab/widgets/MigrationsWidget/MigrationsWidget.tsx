import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMigrationStatusCounts } from '@kubevirt-utils/resources/vmim/utils';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Content, Grid } from '@patternfly/react-core';

import StatusCountItem from '../shared/StatusCountItem';
import ViewAllLink from '../shared/ViewAllLink';

import './MigrationsWidget.scss';

type MigrationsWidgetProps = {
  cardTitle?: string;
  isAllClustersPage: boolean;
  isLoading?: boolean;
  onViewAll?: () => void;
  vmims: V1VirtualMachineInstanceMigration[];
};

const MigrationsWidget: FC<MigrationsWidgetProps> = ({
  cardTitle,
  isAllClustersPage,
  isLoading,
  onViewAll,
  vmims,
}) => {
  const { t } = useKubevirtTranslation();

  const statusCounts = useMemo(() => getMigrationStatusCounts(vmims), [vmims]);

  const title =
    cardTitle ?? (isAllClustersPage ? t('Cross cluster migrations') : t('Compute migrations'));

  return (
    <Card className="migrations-widget" data-test="migrations-widget" isCompact>
      {/* TODO CNV-78882: pass onViewAll once migrations navigation is implemented */}
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
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <Content className="migrations-widget__subheader" component="small">
          {t('Last day')}
        </Content>
        <Grid className="migrations-widget__body-grid" hasGutter>
          <StatusCountItem
            count={statusCounts.failed}
            icon={<vmStatusIcon.Error />}
            isLoading={isLoading}
            label={t('Failed')}
            span={3}
          />
          <StatusCountItem
            count={statusCounts.running}
            icon={<vmStatusIcon.Running />}
            isLoading={isLoading}
            label={t('Running')}
            span={3}
          />
          <StatusCountItem
            count={statusCounts.scheduling}
            icon={<vmStatusIcon.Scheduling />}
            isLoading={isLoading}
            label={t('Scheduling')}
            span={3}
          />
          <StatusCountItem
            count={statusCounts.other}
            icon={<vmStatusIcon.Other />}
            isLoading={isLoading}
            label={t('Other')}
            span={3}
          />
        </Grid>
      </CardBody>
    </Card>
  );
};

export default MigrationsWidget;
