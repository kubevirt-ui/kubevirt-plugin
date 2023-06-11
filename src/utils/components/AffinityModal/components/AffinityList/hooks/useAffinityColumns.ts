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
        id: 'type',
        sort: 'type',
        title: t('Type'),
        transforms: [sortable],
      },
      {
        id: 'condition',
        sort: 'condition',
        title: t('Condition'),
        transforms: [sortable],
      },
      {
        id: 'weight',
        sort: 'weight',
        title: t('Weight'),
        transforms: [sortable],
      },
      {
        id: 'terms',
        title: t('Terms'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  return columns;
};

export default useAffinityColumns;
