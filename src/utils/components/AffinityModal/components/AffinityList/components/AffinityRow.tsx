import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { pluralize } from '@patternfly/react-core';

import { AffinityRowData } from '../../../utils/types';
import { AFFINITY_CONDITION_LABELS, AFFINITY_TYPE_LABLES } from '../utils/constants';

import AffinityRowActionsDropdown from './AffinityRowActionsDropdown';

export type AffinityRowProps = {
  obj: AffinityRowData;
};

const AffinityRow: React.FC<
  RowProps<
    AffinityRowData,
    { onDelete: (affinity: AffinityRowData) => void; onEdit: (affinity: AffinityRowData) => void }
  >
> = ({ activeColumnIDs, obj: affinity, rowData: { onDelete, onEdit } }) => {
  const expressionsLabel =
    affinity?.expressions?.length > 0 && pluralize(affinity?.expressions?.length, 'Expression');
  const fieldsLabel =
    affinity?.fields?.length > 0 && pluralize(affinity?.fields.length, 'Node Field');
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {AFFINITY_TYPE_LABLES[affinity?.type]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="condition">
        {AFFINITY_CONDITION_LABELS[affinity?.condition]}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="weight">
        {affinity?.weight || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="terms">
        <div>{expressionsLabel}</div> <div>{fieldsLabel}</div>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v5-c-table__action" id="">
        <AffinityRowActionsDropdown affinity={affinity} onDelete={onDelete} onEdit={onEdit} />
      </TableData>
    </>
  );
};

export default AffinityRow;
