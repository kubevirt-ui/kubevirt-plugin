import * as React from 'react';
import { VirtualMachineInstanceMigrationModel } from 'src/views/virtualmachines/actions/actions';

import {
  modelToGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1MigrationPolicy,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import {
  ListPageBody,
  ListPageFilter,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { MIGRATIONS_DURATION_KEY } from '../../../top-consumers-card/utils/constants';

import useVirtualMachineInstanceMigrationsColumns from './hooks/useVirtualMachineInstanceMigrationsColumns';
import { getSourceNodeFilter, getStatusFilter, getTargetNodeFilter } from './utils/filters';
import { getMigrationsTableData } from './utils/utils';
import MigrationsRow from './MigrationsRow';

const MigrationTable: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const [vmims, vmimsLoaded, vmimsErrors] = useK8sWatchResource<
    V1VirtualMachineInstanceMigration[]
  >({
    groupVersionKind: modelToGroupVersionKind(VirtualMachineInstanceMigrationModel),
    isList: true,
  });

  const [vmis, vmisLoaded, vmisErrors] = useK8sWatchResource<V1VirtualMachineInstance[]>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
  });

  const [mps] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    groupVersionKind: {
      kind: 'MigrationPolicy',
      group: 'migrations.kubevirt.io',
      version: 'v1alpha1',
    },
    isList: true,
  });

  const [duration] = useLocalStorage(MIGRATIONS_DURATION_KEY);
  const migrationsData = getMigrationsTableData(vmims, vmis, mps, duration);

  const filters = [
    ...getStatusFilter(t),
    ...getSourceNodeFilter(vmis, t),
    ...getTargetNodeFilter(vmis, t),
  ];
  const [unfilteredData, data, onFilterChange] = useListPageFilter(migrationsData, filters);

  const columns = useVirtualMachineInstanceMigrationsColumns();
  return (
    <>
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={vmimsLoaded && vmisLoaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable
          data={data}
          unfilteredData={unfilteredData}
          loaded={vmimsLoaded && vmisLoaded}
          loadError={vmimsErrors || vmisErrors}
          columns={columns}
          Row={MigrationsRow}
          EmptyMsg={() => <Bullseye>{t('No migrations found')}</Bullseye>}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationTable;
