import { useCallback, useMemo } from 'react';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { columnSorting } from '@virtualmachines/list/hooks/utils/utils';

import { getDataSourcePreferenceLabelValue } from '../../utils/utils';

const useBootableVolumesColumns = (
  pagination: { [key: string]: any },
  data: V1beta1DataSource[],
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Operating system'),
        id: 'os',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Description'),
        id: 'description',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.annotations.description'),
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Preference'),
        id: 'preference',
        transforms: [sortable],
        sort: (dataSources, dir) => {
          return dataSources.sort((a, b) => {
            const aUpdated = getDataSourcePreferenceLabelValue(a);
            const bUpdated = getDataSourcePreferenceLabelValue(b);

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
        title: t('Namespace'),
        id: 'namespace',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.namespace'),
        props: { className: 'pf-m-width-20' },
      },
      {
        title: t('Created at'),
        id: 'created',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.creationTimestamp'),
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t, sorting],
  );

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columns: columns,
    showNamespaceOverride: false,
    columnManagementID: DataSourceModelRef,
  });

  return [columns, activeColumns];
};

export default useBootableVolumesColumns;
