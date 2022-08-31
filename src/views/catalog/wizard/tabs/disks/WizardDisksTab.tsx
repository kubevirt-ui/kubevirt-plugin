import * as React from 'react';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { WizardTab } from '@catalog/wizard/tabs';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import DiskListTitle from './components/DiskListTitle';
import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';

const WizardDisksTab: WizardTab = ({ vm, loaded, updateVM, tabsData, updateTabsData }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  return (
    <>
      <ListPageBody>
        <ListPageCreateButton
          className="list-page-create-button-margin"
          isDisabled={!loaded}
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <DiskModal
                vm={vm}
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updateVM}
                headerText={t('Add disk')}
                createOwnerReference={false}
                onUploadedDataVolume={(dataVolume) =>
                  updateTabsData((draft) => {
                    ensurePath(draft, 'disks.dataVolumesToAddOwnerRef');
                    if (draft.disks) {
                      draft.disks.dataVolumesToAddOwnerRef = [
                        ...(tabsData?.disks?.dataVolumesToAddOwnerRef || []),
                        dataVolume,
                      ];
                    }
                  })
                }
              />
            ))
          }
        >
          {t('Add disk')}
        </ListPageCreateButton>
        <DiskListTitle />
        <ListPageFilter
          data={data}
          loaded={disksLoaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
          hideLabelFilter
        />
        <VirtualizedTable
          data={filteredData}
          unfilteredData={data}
          loaded={disksLoaded}
          loadError={undefined}
          columns={columns}
          Row={DiskRow}
        />
      </ListPageBody>
    </>
  );
};

export default WizardDisksTab;
