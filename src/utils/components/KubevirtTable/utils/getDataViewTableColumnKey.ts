import {
  type DataViewTh,
  isDataViewThObject,
} from '@patternfly/react-data-view/dist/esm/DataViewTable';

export const getDataViewTableColumnKey = (columns: DataViewTh[]): string => {
  const columnIds = columns.reduce<string[]>((ids, column) => {
    if (!isDataViewThObject(column)) {
      return ids;
    }

    const id = column.props?.id;
    if (id !== undefined) {
      ids.push(String(id));
    }

    return ids;
  }, []);

  return columnIds.join('|');
};
