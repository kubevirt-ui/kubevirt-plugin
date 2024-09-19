import React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, PageSection, PageSectionVariants } from '@patternfly/react-core';

import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';

const WizardDisksTab: WizardTab = ({ tabsData, updateTabsData, updateVM, vm }) => {
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  return (
    <PageSection variant={PageSectionVariants.light}>
      <ListPageBody>
        <SidebarEditor
          onResourceUpdate={(newVM) => updateVM(newVM)}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.DISKS_TAB}
          resource={vm}
        >
          <DiskSourceSelect
            onSelect={(diskSource: SourceTypes) => {
              return createModal(({ isOpen, onClose }) => (
                <DiskModal
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
                  createDiskSource={diskSource}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ));
            }}
            className="list-page-create-button-margin"
          />
          <Flex>
            <FlexItem>
              <ListPageFilter
                data={data}
                hideLabelFilter
                loaded={disksLoaded}
                onFilterChange={onFilterChange}
                rowFilters={filters}
              />
            </FlexItem>
            <FlexItem>
              <WindowsDrivers updateVM={updateVM} vm={vm} />
            </FlexItem>
          </Flex>
          <VirtualizedTable
            columns={columns}
            data={filteredData}
            loaded={disksLoaded}
            loadError={undefined}
            Row={DiskRow}
            unfilteredData={data}
          />
        </SidebarEditor>
      </ListPageBody>
    </PageSection>
  );
};

export default WizardDisksTab;
