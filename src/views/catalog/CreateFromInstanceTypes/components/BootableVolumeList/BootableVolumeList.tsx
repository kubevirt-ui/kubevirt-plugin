import React, { FC, useEffect, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { convertResourceArrayToMap, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Pagination, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { DEFAULT_PREFERENCE_LABEL } from '../../utils/constants';
import BootableVolumeEmptyState from '../BootableVolumeEmptyState/BootableVolumeEmptyState';

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
  displayShowAllButton?: boolean;
  selectedBootableVolumeState?: [BootableVolume, (selectedVolume: BootableVolume) => void];
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  displayShowAllButton = false,
  selectedBootableVolumeState,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    bootableVolumesData,
    instanceTypesAndPreferencesData,
    instanceTypeVMState,
    onSelectCreatedVolume,
  } = useInstanceTypeVMStore();

  const { selectedBootableVolume } = instanceTypeVMState;
  const { bootableVolumes, loaded, pvcSources } = bootableVolumesData;

  const preferencesMap = useMemo(() => {
    const { preferences } = instanceTypesAndPreferencesData;
    return convertResourceArrayToMap(preferences);
  }, [instanceTypesAndPreferencesData]);

  const { activeColumns, columnLayout } = useBootVolumeColumns(!displayShowAllButton);
  const filters = useBootVolumeFilters(!displayShowAllButton);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  const { getSortType, sortedData } = useBootVolumeSortColumns(
    data,
    preferencesMap,
    pvcSources,
    pagination,
  );
  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const displayVolumes = !isEmpty(bootableVolumes) && loaded;

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
              aria-label="bootable volume list"
              className="bootable-volume-list-bar__volume-namespace"
              isDisabled
              value={OPENSHIFT_OS_IMAGES_NS}
            />
          </FormGroup>
        </SplitItem>

        {displayVolumes && (
          <>
            <SplitItem className="bootable-volume-list-bar__filter">
              <ListPageFilter
                onFilterChange={(...args) => {
                  onFilterChange(...args);
                  setPagination((prevPagination) => ({
                    ...prevPagination,
                    endIndex: prevPagination?.perPage,
                    page: 1,
                    startIndex: 0,
                  }));
                }}
                columnLayout={columnLayout}
                data={unfilteredData}
                hideLabelFilter
                hideNameLabelFilters={!displayShowAllButton}
                loaded={Boolean(loaded)}
                // nameFilter={!displayShowAllButton && "modal-name"} can remove comment once this merged https://github.com/openshift/console/pull/12438 and build into new SDK version
                rowFilters={filters}
              />
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem className="bootable-volume-list-bar__pagination">
              <Pagination
                onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                perPageOptions={
                  displayShowAllButton ? paginationDefaultValuesForm : paginationDefaultValuesModal
                }
                defaultToFullPage
                isCompact={displayShowAllButton}
                itemCount={data?.length}
                page={pagination?.page}
                perPage={pagination?.perPage}
              />
            </SplitItem>
            {displayShowAllButton && <ShowAllBootableVolumesButton />}
          </>
        )}
      </Split>

      {displayVolumes ? (
        <TableComposable variant={TableVariant.compact}>
          <Thead>
            <Tr>
              {activeColumns.map((col, columnIndex) => (
                <Th id={col?.id} key={col?.id} sort={getSortType(columnIndex)}>
                  {col?.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((bs) => (
              <BootableVolumeRow
                rowData={{
                  bootableVolumeSelectedState: !displayShowAllButton
                    ? selectedBootableVolumeState
                    : [selectedBootableVolume, onSelectCreatedVolume],
                  preference: preferencesMap[getLabel(bs, DEFAULT_PREFERENCE_LABEL)],
                  pvcSource: getBootableVolumePVCSource(bs, pvcSources),
                }}
                activeColumnIDs={activeColumns?.map((col) => col?.id)}
                bootableVolume={bs}
                key={getName(bs)}
              />
            ))}
          </Tbody>
        </TableComposable>
      ) : (
        <BootableVolumeEmptyState />
      )}
    </>
  );
};

export default BootableVolumeList;
