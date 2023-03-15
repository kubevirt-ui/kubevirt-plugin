import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Pagination, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { UseBootableVolumesValues } from '../../hooks/useBootableVolumes';
import { DEFAULT_PREFERENCE_LABEL } from '../../utils/constants';

import BootableVolumeRow from './components/BootableVolumeRow/BootableVolumeRow';
import ShowAllBootableVolumesButton from './components/ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';
import useBootVolumeColumns from './hooks/useBootVolumeColumns';
import useBootVolumeFilters from './hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from './hooks/useBootVolumeSortColumns';
import {
  paginationDefaultValuesForm,
  paginationDefaultValuesModal,
  paginationInitialStateForm,
  paginationInitialStateModal,
} from './utils/constants';

import './BootableVolumeList.scss';

export type BootableVolumeListProps = {
  preferences: { [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference };
  bootableVolumeSelectedState: [V1beta1DataSource, Dispatch<SetStateAction<V1beta1DataSource>>];
  bootableVolumesResources: UseBootableVolumesValues;
  displayShowAllButton?: boolean;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  preferences,
  bootableVolumeSelectedState,
  bootableVolumesResources: { bootableVolumes, loaded, pvcSources },
  displayShowAllButton,
}) => {
  const { t } = useKubevirtTranslation();
  const { activeColumns, columnLayout } = useBootVolumeColumns(!displayShowAllButton);
  const filters = useBootVolumeFilters(`osName${!displayShowAllButton && '-modal'}`);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  const { sortedData, getSortType } = useBootVolumeSortColumns(
    data,
    preferences,
    pvcSources,
    pagination,
  );
  const onPageChange = ({ page, perPage, startIndex, endIndex }) => {
    setPagination(() => ({
      page,
      perPage,
      startIndex,
      endIndex,
    }));
  };

  return (
    <>
      <Split className="bootable-volume-list-bar" hasGutter>
        <SplitItem>
          <FormGroup label={t('Volumes project')}>
            <TextInput
              className="bootable-volume-list-bar__volume-namespace"
              value={OPENSHIFT_OS_IMAGES_NS}
              isDisabled
              aria-label="bootable volume list"
            />
          </FormGroup>
        </SplitItem>
        <SplitItem className="bootable-volume-list-bar__filter">
          <ListPageFilter
            hideLabelFilter
            onFilterChange={(...args) => {
              onFilterChange(...args);
              setPagination((prevPagination) => ({
                ...prevPagination,
                page: 1,
                startIndex: 0,
                endIndex: prevPagination?.perPage,
              }));
            }}
            loaded={loaded}
            data={unfilteredData}
            // nameFilter={!displayShowAllButton && "modal-name"} can remove comment once this merged https://github.com/openshift/console/pull/12438 and build into new SDK version
            rowFilters={filters}
            columnLayout={columnLayout}
          />
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem className="bootable-volume-list-bar__pagination">
          <Pagination
            itemCount={data?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            defaultToFullPage
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPageChange({ page, perPage, startIndex, endIndex })
            }
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPageChange({ page, perPage, startIndex, endIndex })
            }
            perPageOptions={
              displayShowAllButton ? paginationDefaultValuesForm : paginationDefaultValuesModal
            }
            isCompact={displayShowAllButton}
          />
        </SplitItem>
        {displayShowAllButton && (
          <ShowAllBootableVolumesButton
            preferences={preferences}
            bootableVolumeSelectedState={bootableVolumeSelectedState}
            bootableVolumesResources={{ bootableVolumes, loaded, pvcSources }}
          />
        )}
      </Split>
      <TableComposable variant={TableVariant.compact}>
        <Thead>
          <Tr>
            {activeColumns.map((col, columnIndex) => (
              <Th sort={getSortType(columnIndex)} key={col?.id} id={col?.id}>
                {col?.title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedData?.map((bs) => (
            <BootableVolumeRow
              key={bs?.metadata?.name}
              bootableVolume={bs}
              activeColumnIDs={Object.values(activeColumns)?.map((col) => col?.id)}
              rowData={{
                bootableVolumeSelectedState,
                preference: preferences[bs?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]],
                pvcSource:
                  pvcSources?.[bs?.spec?.source?.pvc?.namespace]?.[bs?.spec?.source?.pvc?.name],
              }}
            />
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};

export default BootableVolumeList;
