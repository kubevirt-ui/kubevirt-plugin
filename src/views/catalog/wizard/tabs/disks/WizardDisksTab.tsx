import React, { useMemo } from 'react';

import useRegistryCredentials from '@catalog/utils/useRegistryCredentials/useRegistryCredentials';
import { WizardTab } from '@catalog/wizard/tabs';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DiskSourceSelect from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/DiskSourceSelect';
import DiskModal from '@kubevirt-utils/components/DiskModal/DiskModal';
import {
  DefaultFormValues,
  SourceTypes,
  V1DiskFormState,
} from '@kubevirt-utils/components/DiskModal/utils/types';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import WindowsDrivers from '@kubevirt-utils/components/WindowsDrivers/WindowsDrivers';
import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';

import useDisksFilters from './hooks/useDisksFilters';
import useWizardDisksTableData from './hooks/useWizardDisksTableData';
import { getWizardDiskColumns, getWizardDiskRowId } from './wizardDisksTableDefinition';

const WizardDisksTab: WizardTab = ({ tabsData, updateTabsData, updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();
  const [disks, disksLoaded, loadError] = useWizardDisksTableData(vm);
  const filters = useDisksFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(disks, filters);
  const { decodedRegistryCredentials, updateRegistryCredentials } = useRegistryCredentials();
  const columns = useMemo(() => getWizardDiskColumns(t), [t]);

  const handleSubmit = (newVM: V1VirtualMachine, diskFormState?: V1DiskFormState) => {
    const registryCredentials = diskFormState?.registryCredentials;
    !isEmpty(registryCredentials) && updateRegistryCredentials(registryCredentials);
    return updateVM(newVM);
  };

  const defaultFormValues: DefaultFormValues = { registryCredentials: decodedRegistryCredentials };

  return (
    <PageSection>
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
                  defaultFormValues={defaultFormValues}
                  isOpen={isOpen}
                  onClose={onClose}
                  onSubmit={handleSubmit}
                  vm={vm}
                />
              ));
            }}
            canCreateDataVolume
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
            {isWindowsSupported && (
              <FlexItem>
                <WindowsDrivers updateVM={updateVM} vm={vm} />
              </FlexItem>
            )}
          </Flex>
          <KubevirtTable
            ariaLabel={t('Wizard disks table')}
            columns={columns}
            data={filteredData}
            dataTest="wizard-disks-table"
            fixedLayout
            getRowId={getWizardDiskRowId}
            initialSortKey="name"
            loaded={disksLoaded}
            loadError={loadError}
            noDataMsg={t('No disks found')}
            unfilteredData={data}
          />
        </SidebarEditor>
      </ListPageBody>
    </PageSection>
  );
};

export default WizardDisksTab;
