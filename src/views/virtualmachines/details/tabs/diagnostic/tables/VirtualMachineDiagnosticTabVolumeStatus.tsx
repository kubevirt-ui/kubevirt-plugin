import React, { FC, useEffect, useMemo, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Pagination, Title } from '@patternfly/react-core';
import { TableComposable, Th, Thead, Tr } from '@patternfly/react-table';

import useDiagnosticVolumeStatusTableColumns from '../hooks/useDiagnosticVolumeStatusTableColumns';
import { VirtualizationVolumeSnapshotStatus } from '../utils/types';
import VirtualMachineDiagnosticTabRow from '../VirtualMachineDiagnosticTabRow';

type VirtualMachineDiagnosticTabVolumeStatusProps = {
  volumeSnapshotStatuses: VirtualizationVolumeSnapshotStatus[];
};

const VirtualMachineDiagnosticTabVolumeStatus: FC<VirtualMachineDiagnosticTabVolumeStatusProps> = ({
  volumeSnapshotStatuses,
}) => {
  const { t } = useKubevirtTranslation();
  const [expend, setExpend] = useState<{ [key: string]: Set<string> }>({
    expended: new Set(),
    ids: new Set(),
  });

  const { columns, sorting } = useDiagnosticVolumeStatusTableColumns();
  const { onPaginationChange, pagination } = usePagination();
  const sortedData = useMemo(
    () => columnSorting(volumeSnapshotStatuses, sorting?.direction, pagination, sorting?.column),
    [volumeSnapshotStatuses, sorting, pagination],
  );

  useEffect(
    () =>
      volumeSnapshotStatuses.forEach(({ id }) => {
        setExpend((expendObj) => {
          return { expended: new Set(), ids: new Set(expendObj?.ids).add(id) };
        });
      }),
    [volumeSnapshotStatuses],
  );

  return (
    <>
      <ListPageBody>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title className="VirtualMachineDiagnosticTab--header" headingLevel="h2">
              {t('Volume snapshot status')}{' '}
              <HelpTextIcon
                bodyContent={t(
                  'Volume Snapshot Status is a mechanism for reporting if a volume can be snapshotted or not.',
                )}
                helpIconClassName="title-help-text-icon"
              />
            </Title>
          </FlexItem>
          <FlexItem>
            <Pagination
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              defaultToFullPage
              itemCount={sortedData?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </FlexItem>
        </Flex>
      </ListPageBody>

      <TableComposable isExpandable>
        <Thead>
          <Tr>
            <Th
              expand={{
                areAllExpanded: expend.expended.size !== expend.ids.size,
                collapseAllAriaLabel: '',
                onToggle: (_, __, isOpen) => {
                  setExpend((expendObj) => ({
                    expended: new Set(!isOpen ? [] : expendObj.ids),
                    ids: new Set(expendObj?.ids),
                  }));
                },
              }}
            />
            {columns?.map(({ cell: { sort }, title }, index) => {
              return (
                <Th key={title} sort={sort(index)}>
                  {title}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        {sortedData.map((row, index) => (
          <VirtualMachineDiagnosticTabRow
            activeColumns={columns}
            expend={expend}
            index={index}
            key={row?.metadata?.name}
            obj={row}
            setExpend={setExpend}
          />
        ))}
      </TableComposable>
    </>
  );
};

export default VirtualMachineDiagnosticTabVolumeStatus;
