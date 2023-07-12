import { useCallback, useMemo } from 'react';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { BootableResource } from '../../utils/types';
import { getPreferenceReadableOS, getSourcePreferenceLabelValue } from '../../utils/utils';

const useBootableVolumesColumns = (
  pagination: { [key: string]: any },
  data: BootableResource[],
  preferences: V1beta1VirtualMachineClusterPreference[],
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();
  const { endIndex, startIndex } = pagination;

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-20' },
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'namespace',
        props: { className: 'pf-m-width-20' },
        sort: (_, direction) => sorting(direction, 'metadata.namespace'),
        title: t('Namespace'),
        transforms: [sortable],
      },
      {
        id: 'os',
        props: { className: 'pf-m-width-15' },
        sort: (sources, direction) => {
          return sources
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
        title: t('Operating system'),
        transforms: [sortable],
      },
      {
        id: 'description',
        props: { className: 'pf-m-width-15' },
        sort: (_, direction) => sorting(direction, 'metadata.annotations.description'),
        title: t('Description'),
        transforms: [sortable],
      },
      {
        id: 'preference',
        props: { className: 'pf-m-width-15' },
        sort: (sources, direction) => {
          return sources
            .sort((a, b) => {
              const aUpdated = getSourcePreferenceLabelValue(a);
              const bUpdated = getSourcePreferenceLabelValue(b);

              if (aUpdated && bUpdated) {
                return direction === 'asc'
                  ? aUpdated.localeCompare(bUpdated)
                  : bUpdated.localeCompare(aUpdated);
              }
            })
            ?.slice(startIndex, endIndex);
        },
        title: t('Preference'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
        title: '',
      },
    ],
    [t, sorting, startIndex, endIndex, preferences],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: DataSourceModelRef,
    columns,
  });

  return [columns, activeColumns];
};

export default useBootableVolumesColumns;
