import * as React from 'react';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import {
  k8sUpdate,
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import useDiskColumns from '../../hooks/useDiskColumns';
import useDisksFilters from '../../hooks/useDisksFilters';

import DiskListTitle from './DiskListTitle';
import DiskRow from './DiskRow';

type DiskListProps = {
  vm?: V1VirtualMachine;
};

const DiskList: React.FC<DiskListProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
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
      <ListPageHeader title="">
        <ListPageCreateButton onClick={() => setIsModalOpen(true)}>
          {t('Add disk')}
        </ListPageCreateButton>
      </ListPageHeader>
      <ListPageBody>
        <DiskListTitle />
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={DiskRow}
          rowData={{ vm, vmi }}
        />
      </ListPageBody>
      {isModalOpen && (
        <DiskModal
          vm={vm}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          headerText={headerText}
          onSubmit={(obj) =>
            k8sUpdate({
              model: VirtualMachineModel,
              data: obj,
              ns: obj.metadata.namespace,
              name: obj.metadata.name,
            })
          }
        />
      )}
    </>
  );
};

export default DiskList;
