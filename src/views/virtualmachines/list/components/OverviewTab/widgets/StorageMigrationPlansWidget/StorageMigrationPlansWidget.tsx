import React, { FC, useMemo } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { STORAGE_MIGRATION_API } from '@kubevirt-utils/resources/migrations/constants';
import { vmStatusIcon } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateVariant,
  Grid,
  Skeleton,
} from '@patternfly/react-core';
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
  const { csvVersion, loaded, loadError, storageMigAPI, storageMigPlans } =
    useStorageMigrationOverviewData(cluster);
  const { basePath, isExternal, pendingUrl, runningUrl } = useStorageMigrationNavigation(
    cluster,
    storageMigAPI,
    csvVersion,
  );

  const statusCounts = useMemo(
    () => getStorageMigrationStatusCounts(storageMigPlans),
    [storageMigPlans],
  );

  const headerActions = (() => {
    if (storageMigAPI === STORAGE_MIGRATION_API.NONE) {
      return null;
    }
    if (!loaded && !loadError) {
      return (
        <span className="storage-migration-plans-widget__view-all-skeleton">
          <Skeleton fontSize="sm" screenreaderText={t('Loading')} />
        </span>
      );
    }
    return (
      <ViewAllLink
        href={isExternal ? basePath : undefined}
        linkPath={isExternal ? undefined : basePath}
      />
    );
  })();

  const cardBodyContent = (() => {
    if (loadError) {
      return <ErrorAlert error={loadError} />;
    }
    if (storageMigAPI === STORAGE_MIGRATION_API.NONE) {
      return (
        <EmptyState
          headingLevel="h3"
          titleText={t('Storage migration is not available on this cluster.')}
          variant={EmptyStateVariant.sm}
        />
      );
    }
    return (
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
    );
  })();

  return (
    <Card
      className="storage-migration-plans-widget"
      data-test="storage-migration-plans-widget"
      isCompact
    >
      <CardHeader
        actions={{
          actions: headerActions,
          hasNoOffset: false,
        }}
      >
        <CardTitle>{t('Storage migration plans')}</CardTitle>
      </CardHeader>
      <CardBody className="storage-migration-plans-widget__body">{cardBodyContent}</CardBody>
    </Card>
  );
};

export default StorageMigrationPlansWidget;
