import React, { FCC, useMemo } from 'react';

import { V1beta1Plan } from '@kubev2v/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Grid } from '@patternfly/react-core';

import StatusCountItem from '../../shared/StatusCountItem';
import ViewAllLink from '../../shared/ViewAllLink';
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

const CrossClusterMigrationPlansWidget: FCC<CrossClusterMigrationPlansWidgetProps> = ({
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

  return (
    <Card
      className="cross-cluster-migration-plans-widget"
      data-test="cross-cluster-migration-plans-widget"
      isCompact
    >
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
          {[
            {
              count: statusCounts.failed,
              icon: <vmStatusIcon.Error />,
              key: 'failed',
              label: t('Failed'),
            },
            {
              count: statusCounts.running,
              icon: <vmStatusIcon.Running />,
              key: 'running',
              label: t('Running'),
            },
            {
              count: statusCounts.other,
              icon: <vmStatusIcon.Other />,
              key: 'other',
              label: t('Other'),
            },
          ].map(({ count, icon, key, label }) => (
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
