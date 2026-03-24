import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstanceMigration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMigrationStatusCounts } from '@kubevirt-utils/resources/vmim/utils';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Content, Grid } from '@patternfly/react-core';

import StatusCountItem, { getLinkProps } from '../shared/StatusCountItem';
import ViewAllLink from '../shared/ViewAllLink';

import {
  buildStatusFilterPath,
  FAILED_STATUSES,
  MigrationStatusCounts,
  OTHER_STATUSES,
  RUNNING_STATUSES,
  SCHEDULED_STATUSES,
} from './utils/migrationStatusConstants';

import './MigrationsWidget.scss';

type MigrationsWidgetProps = {
  cardTitle?: string;
  isLoading?: boolean;
  migrationsTabHref?: string;
  migrationsTabPath?: string;
  precomputedStatusCounts?: MigrationStatusCounts;
  subHeader?: string;
  vmims?: V1VirtualMachineInstanceMigration[];
};

const MigrationsWidget: FC<MigrationsWidgetProps> = ({
  cardTitle,
  isLoading,
  migrationsTabHref,
  migrationsTabPath,
  precomputedStatusCounts,
  subHeader,
  vmims,
}) => {
  const { t } = useKubevirtTranslation();

  const isExternal = !!migrationsTabHref;
  const basePath = migrationsTabPath || migrationsTabHref;

  const statusCounts = useMemo(
    () => precomputedStatusCounts ?? getMigrationStatusCounts(vmims ?? []),
    [precomputedStatusCounts, vmims],
  );

  const statusLinks = useMemo(() => {
    if (!basePath) return {};
    return {
      failed: buildStatusFilterPath(basePath, FAILED_STATUSES),
      other: buildStatusFilterPath(basePath, OTHER_STATUSES),
      running: buildStatusFilterPath(basePath, RUNNING_STATUSES),
      scheduled: buildStatusFilterPath(basePath, SCHEDULED_STATUSES),
    };
  }, [basePath]);

  const hasNavigation = !!migrationsTabPath || !!migrationsTabHref;

  return (
    <Card className="migrations-widget" data-test="migrations-widget" isCompact>
      <CardHeader
        actions={
          hasNavigation
            ? {
                actions: <ViewAllLink href={migrationsTabHref} linkPath={migrationsTabPath} />,
                hasNoOffset: false,
              }
            : undefined
        }
      >
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardBody>
        {subHeader && (
          <Content className="migrations-widget__subheader" component="small">
            {subHeader}
          </Content>
        )}
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
              count: statusCounts.scheduled,
              icon: <vmStatusIcon.Scheduled />,
              key: 'scheduled',
              label: t('Scheduled'),
            },
            {
              count: statusCounts.other,
              icon: <vmStatusIcon.Other />,
              key: 'other',
              label: t('Other'),
            },
          ].map(({ count, icon, key, label }) => (
            <StatusCountItem
              {...getLinkProps(statusLinks[key], isExternal)}
              count={count}
              icon={icon}
              isLoading={isLoading}
              key={key}
              label={label}
              span={3}
            />
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

export default MigrationsWidget;
