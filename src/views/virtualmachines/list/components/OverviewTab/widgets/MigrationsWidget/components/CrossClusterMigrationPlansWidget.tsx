import React, { type FC, useMemo } from 'react';

import { type V1beta1Plan } from '@forklift-ui/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';
import ViewAllLink from '../../shared/ViewAllLink';
import { getCrossClusterStatusItems } from '../utils/crossClusterStatusItems';
import {
  buildPhaseFilterPath,
  CROSS_CLUSTER_FAILED_STATUSES,
  CROSS_CLUSTER_OTHER_STATUSES,
  CROSS_CLUSTER_RUNNING_STATUSES,
  getCrossClusterMigrationCounts,
} from '../utils/mtvPlanStatus';

import './CrossClusterMigrationPlansWidget.scss';

type CrossClusterMigrationPlansWidgetProps = {
  isLoading: boolean;
  plans: V1beta1Plan[];
  plansListPath: string;
};

const CrossClusterMigrationPlansWidget: FC<CrossClusterMigrationPlansWidgetProps> = ({
  isLoading,
  plans,
  plansListPath,
}) => {
  const { t } = useKubevirtTranslation();

  const statusCounts = useMemo(() => getCrossClusterMigrationCounts(plans), [plans]);

  const statusLinks = useMemo(
    () => ({
      failed: buildPhaseFilterPath(plansListPath, CROSS_CLUSTER_FAILED_STATUSES),
      other: buildPhaseFilterPath(plansListPath, CROSS_CLUSTER_OTHER_STATUSES),
      running: buildPhaseFilterPath(plansListPath, CROSS_CLUSTER_RUNNING_STATUSES),
    }),
    [plansListPath],
  );

  const statusItems = useMemo(() => getCrossClusterStatusItems(statusCounts, t), [statusCounts, t]);

  return (
    <Card className="cross-cluster-migration-plans-widget" isCompact>
      <CardHeader
        actions={{
          actions: <ViewAllLink linkPath={plansListPath} />,
          hasNoOffset: false,
        }}
      >
        <CardTitle>{t('Cross cluster migration plans')}</CardTitle>
      </CardHeader>
      <CardBody>
        <Grid className="status-count-grid" hasGutter>
          {statusItems.map(({ count, icon, key, label }) => (
            <StatusCountItem
              count={count}
              href={statusLinks[key]}
              icon={icon}
              isLoading={isLoading}
              key={key}
              label={label}
            />
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

export default CrossClusterMigrationPlansWidget;
