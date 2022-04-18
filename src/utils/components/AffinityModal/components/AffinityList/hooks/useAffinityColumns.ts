import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { AffinityRowData } from '../../../utils/types';

const useAffinityColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<AffinityRowData>[] = React.useMemo(
    () => [
      {
        title: t('Type'),
        id: 'type',
        transforms: [sortable],
        sort: 'type',
      },
      {
        title: t('Condition'),
        id: 'condition',
        transforms: [sortable],
        sort: 'condition',
      },
      {
        title: t('Weight'),
        id: 'weight',
        transforms: [sortable],
        sort: 'weight',
      },
      {
        title: t('Terms'),
        id: 'terms',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  return columns;
};

export default useAffinityColumns;
