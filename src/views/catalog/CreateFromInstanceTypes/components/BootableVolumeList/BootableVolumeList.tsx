import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getBootableVolumePVCSource } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { ProjectsDropdown } from '@catalog/templatescatalog/components/ProjectsDropdown/ProjectsDropdown';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Split, SplitItem } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { UseBootableVolumesValues } from '../../hooks/useBootableVolumes';
import { DEFAULT_PREFERENCE_LABEL } from '../../utils/constants';

import BootableVolumeRow from './components/BootableVolumeRow/BootableVolumeRow';
import BootableVolumesEmptyState from './components/BootableVolumesEmptyState/BootableVolumesEmptyState';
import BootableVolumesSkeleton from './components/BootableVolumesSkeleton/BootableVolumesSkeleton';
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
import { getPaginationFromVolumeIndex } from './utils/utils';

import './BootableVolumeList.scss';

export type BootableVolumeListProps = {
  preferences: { [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference };
  bootableVolumeSelectedState: [BootableVolume, Dispatch<SetStateAction<BootableVolume>>];
  bootableVolumesResources: UseBootableVolumesValues;
  volumeNamespaceState: [string, Dispatch<SetStateAction<string>>];
  displayShowAllButton?: boolean;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  preferences,
  bootableVolumeSelectedState: [bootableVolumeSelected, setBootableVolumeSelected],
  bootableVolumesResources: { bootableVolumes, loaded, loadError, pvcSources },
  volumeNamespaceState: [volumeNamespace, setVolumeNamespace],
  displayShowAllButton,
}) => {
  const { t } = useKubevirtTranslation();
  const { activeColumns, columnLayout } = useBootVolumeColumns(
    !displayShowAllButton,
    volumeNamespace,
  );
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

  const handleVolumeNamespaceSelect = (project: string) => {
    if (bootableVolumeSelected?.metadata?.namespace !== project && project !== '') {
      setBootableVolumeSelected(null);
    }

    return setVolumeNamespace(project);
  };

  useEffect(() => {
    if (displayShowAllButton && !isEmpty(bootableVolumeSelected)) {
      const selectedVolumeIndex = bootableVolumes?.findIndex(
        (volume) => getName(volume) === getName(bootableVolumeSelected),
      );
      setPagination(getPaginationFromVolumeIndex(selectedVolumeIndex));
    }
  }, [bootableVolumeSelected, bootableVolumes, displayShowAllButton]);

  if (!loaded && !loadError) {
    return <BootableVolumesSkeleton />;
  }

  if (isEmpty(bootableVolumes)) {
    return (
      <BootableVolumesEmptyState
        volumeNamespace={volumeNamespace}
        setVolumeNamespace={setVolumeNamespace}
      />
    );
  }

  return (
    <>
      <Split className="bootable-volume-list-bar" hasGutter>
        <SplitItem>
          <ProjectsDropdown
            selectedProject={volumeNamespace}
            onChange={handleVolumeNamespaceSelect}
            title={t('Volumes project')}
          />
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
            bootableVolumeSelectedState={[bootableVolumeSelected, setBootableVolumeSelected]}
            bootableVolumesResources={{ bootableVolumes, loaded, pvcSources }}
            volumeNamespaceState={[volumeNamespace, setVolumeNamespace]}
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
                bootableVolumeSelectedState: [bootableVolumeSelected, setBootableVolumeSelected],
                preference: preferences[bs?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]],
                pvcSource: getBootableVolumePVCSource(bs, pvcSources),
              }}
            />
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};

export default BootableVolumeList;
