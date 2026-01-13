import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DataViewTable } from '@patternfly/react-data-view';

import { NodeEnactmentStateDetails } from '../../../../../../utils/types';

import { getEnactmentStateRows, getEnactmentStateTableColumns } from './utils/utils';

type EnactmentStateTableProps = {
  nodeEnactmentStateDetails: NodeEnactmentStateDetails[];
};

const EnactmentStateTable: FC<EnactmentStateTableProps> = ({ nodeEnactmentStateDetails }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DataViewTable
      aria-label={t('Enactment state table')}
      columns={getEnactmentStateTableColumns(t)}
      rows={getEnactmentStateRows(nodeEnactmentStateDetails)}
    />
  );
};

export default EnactmentStateTable;
