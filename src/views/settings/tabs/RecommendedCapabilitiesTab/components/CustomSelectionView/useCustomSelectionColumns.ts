import { useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useDataViewSort } from '@patternfly/react-data-view';
import { type ThProps } from '@patternfly/react-table';

export const COLUMN_KEYS = {
  actions: 'actions',
  name: 'name',
  status: 'status',
};

const SORTABLE_KEYS = [COLUMN_KEYS.name, COLUMN_KEYS.status];

export const useCustomSelectionColumns = () => {
  const { t } = useKubevirtTranslation();

  const { direction, onSort, sortBy } = useDataViewSort({
    initialSort: { direction: 'asc', sortBy: COLUMN_KEYS.name },
  });

  const getSortParams = useCallback(
    (key: string): ThProps['sort'] | undefined => {
      if (!SORTABLE_KEYS.includes(key)) return undefined;
      const columnIndex = SORTABLE_KEYS.indexOf(key);
      return {
        columnIndex,
        onSort: (_event, _index, dir) => onSort(_event, key, dir),
        sortBy: {
          defaultDirection: 'asc',
          direction,
          index: SORTABLE_KEYS.indexOf(sortBy ?? COLUMN_KEYS.name),
        },
      };
    },
    [direction, onSort, sortBy],
  );

  const columns = useMemo(
    () => [
      { cell: t('Name'), props: { sort: getSortParams(COLUMN_KEYS.name) } },
      { cell: t('Status'), props: { sort: getSortParams(COLUMN_KEYS.status) } },
      { cell: '', props: { className: 'pf-v6-c-table__action' } },
    ],
    [getSortParams, t],
  );

  return { columns, direction, sortBy };
};
