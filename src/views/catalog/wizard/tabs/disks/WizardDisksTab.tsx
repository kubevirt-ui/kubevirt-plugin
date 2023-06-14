import React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
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

import DiskRow from './components/DiskRow';
import useDiskColumns from './hooks/useDiskColumns';
import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';

import './wizard-disk-tab.scss';

const WizardDisksTab: WizardTab = ({ loaded, tabsData, updateTabsData, updateVM, vm }) => {
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
          onResourceUpdate={(newVM) => updateVM(newVM)}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.DISKS_TAB}
          resource={vm}
        >
          <Flex className="wizard-disk-tab__flex">
            {t('The following information is provided by the OpenShift Virtualization operator.')}
          </Flex>
          <ListPageCreateButton
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
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
                  createOwnerReference={false}
                  headerText={t('Add disk')}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={updateVM}
                  vm={vm}
                />
              ))
            }
            className="wizard-disk-tab__list-page-create-button"
            isDisabled={!loaded}
          >
            {t('Add disk')}
          </ListPageCreateButton>

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
    </div>
  );
};

export default WizardDisksTab;
