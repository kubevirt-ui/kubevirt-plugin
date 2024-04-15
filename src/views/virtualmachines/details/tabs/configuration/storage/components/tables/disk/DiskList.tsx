import React, { FC } from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import useProvisioningPercentage from '@kubevirt-utils/resources/vm/hooks/useProvisioningPercentage';
import {
  ListPageCreateButton,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksFilters from '../../hooks/useDisksFilters';

import DiskRow from './DiskRow';

import './disklist.scss';

type DiskListProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DiskList: FC<DiskListProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, loaded, loadError] = useDisksTableData(vm, vmi);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  const { percentages: provisioningPercentages } = useProvisioningPercentage(vm);

  const headerText =
    vm?.status?.printableStatus === printableVMStatus.Running
      ? t('Add disk (hot plugged)')
      : t('Add disk');

  return (
    <div className="kv-configuration-vm-disk-list">
      <DiskListTitle />
      <ListPageCreateButton
        onClick={() =>
          createModal(({ isOpen, onClose }) => (
            <DiskModal
              headerText={headerText}
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={updateDisks}
              vm={vm}
            />
          ))
        }
        className="disk-list-page__list-page-create-button"
      >
        {t('Add disk')}
      </ListPageCreateButton>
      <Flex>
        <FlexItem>
          <ListPageFilter
            data={data}
            hideLabelFilter
            loaded={loaded}
            onFilterChange={onFilterChange}
            rowFilters={filters}
          />
        </FlexItem>

        <FlexItem>
          <WindowsDrivers updateVM={updateDisks} vm={vm} />
        </FlexItem>
      </Flex>
      <VirtualizedTable
        columns={columns}
        data={filteredData}
        loaded={loaded}
        loadError={loadError}
        Row={DiskRow}
        rowData={{ provisioningPercentages, vm, vmi }}
        unfilteredData={data}
      />
    </div>
  );
};

export default DiskList;
