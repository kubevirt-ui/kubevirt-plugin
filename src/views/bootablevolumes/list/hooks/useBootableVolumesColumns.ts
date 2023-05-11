import { useCallback, useMemo } from 'react';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { getDataSourcePreferenceLabelValue, getPreferenceReadableOS } from '../../utils/utils';

const useBootableVolumesColumns = (
  pagination: { [key: string]: any },
  data: V1beta1DataSource[],
  preferences: V1alpha2VirtualMachineClusterPreference[],
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();
  const { startIndex, endIndex } = pagination;

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
        transforms: [sortable],
        sort: (dataSources, direction) => {
          return dataSources
            .sort((a, b) => {
              const aUpdated = getPreferenceReadableOS(a, preferences);
              const bUpdated = getPreferenceReadableOS(b, preferences);

              if (aUpdated && bUpdated) {
                return direction === 'asc'
                  ? aUpdated.localeCompare(bUpdated)
                  : bUpdated.localeCompare(aUpdated);
              }
            })
            ?.slice(startIndex, endIndex);
        },
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
        sort: (dataSources, direction) => {
          return dataSources
            .sort((a, b) => {
              const aUpdated = getDataSourcePreferenceLabelValue(a);
              const bUpdated = getDataSourcePreferenceLabelValue(b);

              if (aUpdated && bUpdated) {
                return direction === 'asc'
                  ? aUpdated.localeCompare(bUpdated)
                  : bUpdated.localeCompare(aUpdated);
              }
            })
            ?.slice(startIndex, endIndex);
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
    [t, sorting, startIndex, endIndex, preferences],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columns,
    columnManagementID: DataSourceModelRef,
  });

  return [columns, activeColumns];
};

export default useBootableVolumesColumns;
