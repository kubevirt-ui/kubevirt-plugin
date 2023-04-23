import React, { FC } from 'react';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-utils/models';
import {
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import ClusterPreferenceRow from './components/ClusterPreferenceRow';
import useClusterPreferenceListColumns from './hooks/useClusterPreferenceListColumns';

type ClusterPreferenceListProps = {
  kind: string;
};

const ClusterPreferenceList: FC<ClusterPreferenceListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [preferences, loaded, loadError] = useK8sWatchResource<
    V1alpha2VirtualMachineClusterPreference[]
  >({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const [columns, activeColumns] = useClusterPreferenceListColumns();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(preferences);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineClusterPreferences')}>
        <ListPageCreate createAccessReview={{ groupVersionKind: kind }} groupVersionKind={kind}>
          {t('Create')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: kind,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: '',
          }}
        />
        <VirtualizedTable<V1alpha2VirtualMachineClusterPreference>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={activeColumns}
          Row={ClusterPreferenceRow}
        />
      </ListPageBody>
    </>
  );
};

export default ClusterPreferenceList;
