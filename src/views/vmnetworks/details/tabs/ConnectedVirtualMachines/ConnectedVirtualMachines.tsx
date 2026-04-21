import React, { FC, useCallback, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { VirtualMachineModel } from '@kubevirt-utils/models';
import { asAccessReview, getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import { Action } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/actions';
import { BulkSelect, BulkSelectValue } from '@patternfly/react-component-groups';
import { Flex, Pagination } from '@patternfly/react-core';

import useConnectedVMs from '../../../hooks/useConnectedVMs';

import DisconnectVMModal, { DisconnectVMModalProps } from './actions/components/DisconnectVMModal';
import MoveVMModal, { MoveVMModalProps } from './actions/components/MoveVMModal';
import {
  ConnectedVMsCallbacks,
  getConnectedVMRowId,
  getConnectedVMsColumns,
} from './connectedVirtualMachinesDefinition';
import { CONNECTED_VMS_COLUMN_KEYS } from './constants';

import '@kubevirt-utils/styles/list-managment-group.scss';

type ConnectedVirtualMachinesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedVirtualMachines: FC<ConnectedVirtualMachinesProps> = ({ obj: vmNetwork }) => {
  const { t } = useKubevirtTranslation();
  const createModal = useModal();
  const [vms, loadedVMs, error] = useConnectedVMs(vmNetwork);
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(vms);
  const [selectedVMs, setSelectedVMs] = useState<V1VirtualMachine[]>([]);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

  const vmNetworkName = getName(vmNetwork);

  const createActions = useCallback(
    (vmList: V1VirtualMachine[]): Action[] => {
      const vm = vmList[0];
      const accessReview = vm ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined;

      return [
        {
          accessReview,
          cta: () =>
            createModal<DisconnectVMModalProps>(DisconnectVMModal, {
              currentNetwork: vmNetworkName,
              vms: vmList,
            }),
          id: 'disconnect-vm',
          label: t('Disconnect virtual machine from network'),
        },
        {
          accessReview,
          cta: () =>
            createModal<MoveVMModalProps>(MoveVMModal, {
              currentNetwork: vmNetworkName,
              vms: vmList,
            }),
          id: 'move-vm',
          label: t('Move virtual machine to another network'),
        },
      ];
    },
    [createModal, vmNetworkName, t],
  );

  const bulkActions = useMemo(() => createActions(selectedVMs), [createActions, selectedVMs]);

  const columns = useMemo(() => getConnectedVMsColumns(t), [t]);

  const callbacks: ConnectedVMsCallbacks = useMemo(
    () => ({
      getActions: createActions,
      vmNetwork,
    }),
    [createActions, vmNetwork],
  );

  if (!loadedVMs) {
    return (
      <ListPageBody>
        <ListSkeleton />
      </ListPageBody>
    );
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <Flex>
          <BulkSelect
            onSelect={(value) => {
              if (value === BulkSelectValue.all) {
                setSelectedVMs(filteredData);
              } else if (value === BulkSelectValue.none) {
                setSelectedVMs([]);
              }
            }}
            canSelectAll
            selectedCount={selectedVMs.length}
            totalCount={filteredData.length}
          />
          <ListPageFilter
            data={unfilteredData}
            loaded={loadedVMs}
            onFilterChange={handleFilterChange}
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
        noDataMsg={t('No connected virtual machines found')}
        noFilteredDataMsg={t('No virtual machines match the filter criteria')}
        onSelect={setSelectedVMs}
        pagination={pagination}
        selectable
        selectedItems={selectedVMs}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default ConnectedVirtualMachines;
