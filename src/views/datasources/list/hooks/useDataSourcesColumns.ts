import * as React from 'react';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { getDataSourceCronJob, getDataSourceLastUpdated } from '../../utils';

export const useDataSourcesColumns = (namespace: string) => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1beta1DataSource>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
        props: { className: 'pf-m-width-15' },
      },
      ...(!namespace
        ? [
            {
              title: t('Namespace'),
              id: 'namespace',
              transforms: [sortable],
              sort: 'metadata.namespace',
              props: { className: 'pf-m-width-10' },
            },
          ]
        : []),
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        sort: 'metadata.creationTimestamp',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Updated'),
        id: 'updated',
        transforms: [sortable],
        sort: (dataSources, dir) => {
          return dataSources.sort((a, b) => {
            const aUpdated = getDataSourceLastUpdated(a);
            const bUpdated = getDataSourceLastUpdated(b);

            if (aUpdated && bUpdated) {
              return dir === 'asc'
                ? aUpdated.localeCompare(bUpdated)
                : bUpdated.localeCompare(aUpdated);
            }
          });
        },
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Auto update'),
        id: 'import-cron',
        transforms: [sortable],
        additional: true,
        sort: (dataSources, dir) =>
          // sort by boolean, if cron is available or not
          dataSources.sort(
            (a, b) =>
              Number(!!getDataSourceCronJob(dir === 'asc' ? b : a)) -
              Number(!!getDataSourceCronJob(dir === 'asc' ? a : b)),
          ),
        props: { className: 'pf-m-width-10' },
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t, namespace],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<V1beta1DataSource>({
    columns,
    columnManagementID: DataSourceModelRef,
  });

  return [columns, activeColumns];
};
