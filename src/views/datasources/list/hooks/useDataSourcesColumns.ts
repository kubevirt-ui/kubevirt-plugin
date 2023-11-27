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
        id: 'name',
        props: { className: 'pf-m-width-15' },
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      ...(!namespace
        ? [
            {
              id: 'namespace',
              props: { className: 'pf-m-width-10' },
              sort: 'metadata.namespace',
              title: t('Namespace'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        id: 'created',
        props: { className: 'pf-m-width-15' },
        sort: 'metadata.creationTimestamp',
        title: t('Created'),
        transforms: [sortable],
      },
      {
        id: 'updated',
        props: { className: 'pf-m-width-15' },
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
        title: t('Updated'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'import-cron',
        props: { className: 'pf-m-width-10' },
        sort: (dataSources, dir) =>
          // sort by boolean, if cron is available or not
          dataSources.sort(
            (a, b) =>
              Number(!!getDataSourceCronJob(dir === 'asc' ? b : a)) -
              Number(!!getDataSourceCronJob(dir === 'asc' ? a : b)),
          ),
        title: t('Auto update'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
        title: '',
      },
    ],
    [t, namespace],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<V1beta1DataSource>({
    columnManagementID: DataSourceModelRef,
    columns,
  });

  return [columns, activeColumns];
};
