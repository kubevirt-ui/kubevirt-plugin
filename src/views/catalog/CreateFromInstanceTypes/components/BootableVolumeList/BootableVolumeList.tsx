import React, { FC, useEffect, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getBootableVolumePVCSource } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Pagination, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

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
import { getPaginationFromVolumeIndex } from './utils/utils';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  selectedBootableVolumeState?: [BootableVolume, (selectedVolume: BootableVolume) => void];
  displayShowAllButton?: boolean;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  selectedBootableVolumeState,
  displayShowAllButton = false,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    instanceTypeVMState,
    bootableVolumesData,
    onSelectVolume,
    instanceTypesAndPreferencesData,
  } = useInstanceTypeVMStore();

  const { selectedBootableVolume } = instanceTypeVMState;
  const { bootableVolumes, loaded, pvcSources } = bootableVolumesData;

  const preferencesMap = useMemo(() => {
    const { preferences } = instanceTypesAndPreferencesData;
    return convertResourceArrayToMap(preferences);
  }, [instanceTypesAndPreferencesData]);

  const { activeColumns, columnLayout } = useBootVolumeColumns(!displayShowAllButton);
  const filters = useBootVolumeFilters(`osName${!displayShowAllButton && '-modal'}`);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  const { sortedData, getSortType } = useBootVolumeSortColumns(
    data,
    preferencesMap,
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

  useEffect(() => {
    if (displayShowAllButton && !isEmpty(selectedBootableVolume)) {
      const selectedVolumeIndex = bootableVolumes?.findIndex(
        (volume) => getName(volume) === getName(selectedBootableVolume),
      );
      setPagination(getPaginationFromVolumeIndex(selectedVolumeIndex));
    }
  }, [selectedBootableVolume, bootableVolumes, displayShowAllButton]);

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
            hideNameLabelFilters={!displayShowAllButton}
            onFilterChange={(...args) => {
              onFilterChange(...args);
              setPagination((prevPagination) => ({
                ...prevPagination,
                page: 1,
                startIndex: 0,
                endIndex: prevPagination?.perPage,
              }));
            }}
            loaded={Boolean(loaded)}
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
        {displayShowAllButton && <ShowAllBootableVolumesButton />}
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
              key={getName(bs)}
              bootableVolume={bs}
              activeColumnIDs={activeColumns?.map((col) => col?.id)}
              rowData={{
                bootableVolumeSelectedState: !displayShowAllButton
                  ? selectedBootableVolumeState
                  : [selectedBootableVolume, onSelectVolume],
                preference: preferencesMap[getLabel(bs, DEFAULT_PREFERENCE_LABEL)],
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
