import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import DiskListTitle from './components/DiskListTitle';
import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';

const WizardDisksTab: WizardTab = ({ vm, loaded, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton
          isDisabled={!loaded}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DiskModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updateVM}
                headerText={t('Add disk')}
              />
            ))
          }
        >
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
          loadError={undefined}
          columns={columns}
          Row={DiskRow}
        />
      </ListPageBody>
    </>
  );
};

export default WizardDisksTab;
