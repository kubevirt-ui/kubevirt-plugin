import React, { FC, useCallback, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListSkeleton from '@kubevirt-utils/components/StateHandler/ListSkeleton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import { Flex } from '@patternfly/react-core';

import useConnectedVMs from '../../../hooks/useConnectedVMs';

import DisconnectVMModal, { DisconnectVMModalProps } from './actions/components/DisconnectVMModal';
import MoveVMModal, { MoveVMModalProps } from './actions/components/MoveVMModal';
import {
  ConnectedVMsCallbacks,
  getConnectedVMRowId,
  getConnectedVMsColumns,
} from './connectedVirtualMachinesDefinition';

type ConnectedVirtualMachinesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const ConnectedVirtualMachines: FC<ConnectedVirtualMachinesProps> = ({ obj: vmNetwork }) => {
  const { t } = useKubevirtTranslation();
  const createModal = useModal();
  const [vms, loadedVMs, error] = useConnectedVMs(vmNetwork);
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(vms);
  const [selectedVMs, setSelectedVMs] = useState<V1VirtualMachine[]>([]);

  const vmNetworkName = getName(vmNetwork);

  const createActions = useCallback(
    (vmList: V1VirtualMachine[]): Action[] => {
      const isSingleVM = vmList.length === 1;
      const vm = vmList[0];

      return [
        {
          accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
          cta: () =>
            createModal<DisconnectVMModalProps>(DisconnectVMModal, {
              currentNetwork: vmNetworkName,
              vms: vmList,
            }),
          id: 'disconnect-vm',
          label: t('Disconnect virtual machine from network'),
        },
        {
          accessReview: isSingleVM ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined,
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
      <Flex>
        <ListPageFilter data={unfilteredData} loaded={loadedVMs} onFilterChange={onFilterChange} />
        <ActionsDropdown
          actions={bulkActions}
          id="vm-bulk-actions"
          isDisabled={isEmpty(selectedVMs)}
        />
      </Flex>
      <KubevirtTable<V1VirtualMachine, ConnectedVMsCallbacks>
        ariaLabel={t('Connected virtual machines table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData}
        dataTest="connected-vms-table"
        fixedLayout
        getRowId={getConnectedVMRowId}
        initialSortKey="name"
        loaded={loadedVMs}
        loadError={error}
        noDataMsg={t('No connected virtual machines found')}
        noFilteredDataMsg={t('No virtual machines match the filter criteria')}
        onSelect={setSelectedVMs}
        selectable
        selectedItems={selectedVMs}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default ConnectedVirtualMachines;
