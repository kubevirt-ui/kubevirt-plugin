import React, { FC } from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskListTitle from '@kubevirt-utils/components/DiskListTitle/DiskListTitle';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import {
  k8sUpdate,
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksFilters from '../../hooks/useDisksFilters';

import DiskRow from './DiskRow';

type DiskListProps = {
  vm?: V1VirtualMachine;
};

const DiskList: FC<DiskListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, loaded, loadError, vmi] = useDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const headerText =
    vm?.status?.printableStatus === printableVMStatus.Running
      ? t('Add disk (hot plugged)')
      : t('Add disk');

  return (
    <>
      <ListPageBody>
        <DiskListTitle />

        <ListPageCreateButton
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DiskModal
                onSubmit={(obj) =>
                  k8sUpdate({
                    data: obj,
                    model: VirtualMachineModel,
                    name: obj.metadata.name,
                    ns: obj.metadata.namespace,
                  })
                }
                headerText={headerText}
                isOpen={isOpen}
                onClose={onClose}
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
            <WindowsDrivers
              updateVM={(newVM) =>
                k8sUpdate({
                  data: newVM,
                  model: VirtualMachineModel,
                  name: newVM?.metadata?.name,
                  ns: newVM?.metadata?.namespace,
                })
              }
              vm={vm}
            />
          </FlexItem>
        </Flex>
        <VirtualizedTable
          columns={columns}
          data={filteredData}
          loaded={loaded}
          loadError={loadError}
          Row={DiskRow}
          rowData={{ vm, vmi }}
          unfilteredData={data}
        />
      </ListPageBody>
    </>
  );
};

export default DiskList;
