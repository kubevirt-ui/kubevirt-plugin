import * as React from 'react';

import { WizardVMContextType } from '@catalog/utils/WizardVMContext';
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

const WizardDisksTab: React.FC<WizardVMContextType> = ({ vm, loaded, error }) => {
  const { t } = useKubevirtTranslation();
  const columns = useDiskColumns();
  const [disks] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  return (
    <>
      <ListPageHeader title="">
        <ListPageCreateButton isDisabled={!loaded}>{t('Add disk')}</ListPageCreateButton>
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
          loadError={error}
          columns={columns}
          Row={DiskRow}
        />
      </ListPageBody>
    </>
  );
};

export default WizardDisksTab;
