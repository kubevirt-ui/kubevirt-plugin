import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewTh, useDataViewSort } from '@patternfly/react-data-view';
import { ThProps } from '@patternfly/react-table';

const useDataViewColumnTH = (activeColumns: TableColumn<K8sResourceCommon>[]): DataViewTh[] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { direction, onSort, sortBy } = useDataViewSort({ searchParams, setSearchParams });

  const sortColumnIndex = useMemo(
    () => activeColumns.findIndex((item) => item.title === sortBy),
    [activeColumns, sortBy],
  );

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] => ({
      columnIndex,
      onSort: (_event, index, sortDirection) =>
        onSort(_event, activeColumns[index].title, sortDirection),
      sortBy: {
        defaultDirection: 'asc',
        direction,
        index: sortColumnIndex,
      },
    }),
    [activeColumns, direction, onSort, sortColumnIndex],
  );

  return useMemo(
    () =>
      activeColumns?.map((column, index) => ({
        cell: column.title,
        props: !isEmpty(column.sort) ? { sort: getSortParams(index) } : null,
      })),
    [activeColumns, getSortParams],
  );
};

export default useDataViewColumnTH;
