import React, { FC, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Pagination, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { TableComposable, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import useBootableVolumes from '../../hooks/useBootableVolumes';
import { DEFAULT_PREFERENCE_LABEL } from '../../utils/constants';

import BootableVolumeRow from './components/BootableVolumeRow/BootableVolumeRow';
import ShowAllBootableVolumesButton from './components/ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';
import useBootVolumeColumns from './hooks/useBootVolumeColumns';
import useBootVolumeFilters from './hooks/useBootVolumeFilters';
import {
  paginationDefaultValuesForm,
  paginationDefaultValuesModal,
  paginationInitialStateForm,
  paginationInitialStateModal,
} from './utils/constants';

import './BootableVolumeList.scss';

export type BootableVolumeListProps = {
  preferences: { [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference };
  bootableVolumeSelectedState: [
    V1beta1DataSource,
    React.Dispatch<React.SetStateAction<V1beta1DataSource>>,
  ];
  displayShowAllButton?: boolean;
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  preferences,
  bootableVolumeSelectedState,
  displayShowAllButton,
}) => {
  const { t } = useKubevirtTranslation();
  const { bootableVolumes, loaded } = useBootableVolumes();
  const columns = useBootVolumeColumns();
  const filters = useBootVolumeFilters(`osName${!displayShowAllButton && '-modal'}`);
  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
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
            />
          </FormGroup>
        </SplitItem>
        <SplitItem className="bootable-volume-list-bar__filter">
          <ListPageFilter
            hideLabelFilter
            onFilterChange={onFilterChange}
            loaded={loaded}
            data={unfilteredData}
            // nameFilter={!displayShowAllButton && "modal-name"} can remove comment once this merged https://github.com/openshift/console/pull/12438 and build into new SDK version
            rowFilters={filters}
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
          />
        )}
      </Split>
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            {columns.map((col) => (
              <Th key={col?.id} id={col?.id} width={col?.id === 'description' ? 40 : 30}>
                {col?.title}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((bs) => (
            <BootableVolumeRow
              key={bs?.metadata?.name}
              bootableVolume={bs}
              rowData={{
                bootableVolumeSelectedState,
                preference: preferences[bs?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]],
              }}
            />
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};

export default BootableVolumeList;
