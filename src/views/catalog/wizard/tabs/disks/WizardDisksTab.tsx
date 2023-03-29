import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageCreateButton,
  ListPageFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import DiskListTitle from './components/DiskListTitle';
import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';

import './wizard-disk-tab.scss';

const WizardDisksTab: WizardTab = ({ vm, loaded, updateVM, tabsData, updateTabsData }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const columns = useDiskColumns();
  const [disks, disksLoaded] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);

  return (
    <div className="wizard-disk-tab">
      <ListPageBody>
        <SidebarEditor
          resource={vm}
          onResourceUpdate={(newVM) => updateVM(newVM)}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.DISKS_TAB}
        >
          <Flex>
            <FlexItem>
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
            </FlexItem>
            <FlexItem>
              <SidebarEditorSwitch />
            </FlexItem>
          </Flex>
          <DiskListTitle />
          <Flex>
            <FlexItem>
              <ListPageFilter
                data={data}
                loaded={disksLoaded}
                rowFilters={filters}
                onFilterChange={onFilterChange}
                hideLabelFilter
              />
            </FlexItem>
            <FlexItem>
              <WindowsDrivers vm={vm} updateVM={updateVM} />
            </FlexItem>
          </Flex>
          <VirtualizedTable
            data={filteredData}
            unfilteredData={data}
            loaded={disksLoaded}
            loadError={undefined}
            columns={columns}
            Row={DiskRow}
          />
        </SidebarEditor>
      </ListPageBody>
    </div>
  );
};

export default WizardDisksTab;
