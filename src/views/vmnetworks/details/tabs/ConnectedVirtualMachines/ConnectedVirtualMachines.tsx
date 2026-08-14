import React, { type FC, useMemo, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useSortedTableData } from '@kubevirt-utils/hooks/useDataViewTableSort/useSortedTableData';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import useConnectedVMs from '../../../hooks/useConnectedVMs';
import ConnectedVMsBulkSelect from './components/ConnectedVMsBulkSelect';
import {
  type ConnectedVMsCallbacks,
  getConnectedVMRowId,
  getConnectedVMsColumns,
} from './connectedVirtualMachinesDefinition';
import { CONNECTED_VMS_COLUMN_KEYS } from './constants';
import useConnectedVMActions from './hooks/useConnectedVMActions';

import '@kubevirt-utils/styles/list-managment-group.scss';

type ConnectedVirtualMachinesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedVirtualMachines: FC<ConnectedVirtualMachinesProps> = ({ obj: vmNetwork }) => {
  const { t } = useKubevirtTranslation();
  const [vms, loadedVMs, error] = useConnectedVMs(vmNetwork);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: vms ?? [],
  });
  const [selectedVMs, setSelectedVMs] = useState<V1VirtualMachine[]>([]);

  const {
    handleFilterChange: handleSetFilters,
    handlePerPageSelect,
    handleSetPage,
    pagination,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const vmNetworkName = getName(vmNetwork);
  const createActions = useConnectedVMActions(vmNetworkName);

  const bulkActions = useMemo(() => createActions(selectedVMs), [createActions, selectedVMs]);

  const columns = useMemo(() => getConnectedVMsColumns(t), [t]);

  const callbacks: ConnectedVMsCallbacks = useMemo(
    () => ({
      getActions: createActions,
      vmNetwork,
    }),
    [createActions, vmNetwork],
  );

  const sortedVMs = useSortedTableData({
    callbacks,
    columns,
    data: filteredData,
    initialSortKey: CONNECTED_VMS_COLUMN_KEYS.name,
  });

  if (!loadedVMs) {
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );
  }

  if (isEmpty(vms) && !error) {
    return (
      <ListPageBody>
        <ListEmptyState
          bodyContent={t('Virtual machines connected to this network will appear here.')}
          icon={VirtualMachineIcon}
          titleText={t('No connected virtual machines yet')}
        />
      </ListPageBody>
    );
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <Flex>
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            data={vms}
            filters={filters}
            loaded={loadedVMs}
            onSetFilters={handleSetFilters}
            toolbarStartContent={
              <ConnectedVMsBulkSelect
                filteredVMs={sortedVMs}
                pagination={pagination}
                selectedVMs={selectedVMs}
                setSelectedVMs={setSelectedVMs}
              />
            }
          />
          <ActionsDropdown
            actions={bulkActions}
            id="vm-bulk-actions"
            isDisabled={isEmpty(selectedVMs)}
          />
        </Flex>
        {!isEmpty(filteredData) && (
          <Pagination
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={filteredData?.length}
            onPerPageSelect={handlePerPageSelect}
            onSetPage={handleSetPage}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      <KubevirtTable<V1VirtualMachine, ConnectedVMsCallbacks>
        ariaLabel={t('Connected virtual machines table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="connected-vms-table"
        fixedLayout
        getRowId={getConnectedVMRowId}
        initialSortKey={CONNECTED_VMS_COLUMN_KEYS.name}
        loaded={loadedVMs}
        loadError={error}
        noFilteredDataMsg={t('No virtual machines match the filter criteria')}
        onSelect={setSelectedVMs}
        pagination={pagination}
        persistSortInUrl
        selectable
        selectedItems={selectedVMs}
        showSelectAllCheckbox={false}
        unfilteredData={vms}
      />
    </ListPageBody>
  );
};

export default ConnectedVirtualMachines;
