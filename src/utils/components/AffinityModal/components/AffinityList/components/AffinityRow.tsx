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
    { onEdit: (affinity: AffinityRowData) => void; onDelete: (affinity: AffinityRowData) => void }
  >
> = ({ obj: affinity, activeColumnIDs, rowData: { onEdit, onDelete } }) => {
  const expressionsLabel =
    affinity?.expressions?.length > 0 && pluralize(affinity?.expressions?.length, 'Expression');
  const fieldsLabel =
    affinity?.fields?.length > 0 && pluralize(affinity?.fields.length, 'Node Field');
  return (
    <>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {AFFINITY_TYPE_LABLES[affinity?.type]}
      </TableData>
      <TableData id="condition" activeColumnIDs={activeColumnIDs}>
        {AFFINITY_CONDITION_LABELS[affinity?.condition]}
      </TableData>
      <TableData id="weight" activeColumnIDs={activeColumnIDs}>
        {affinity?.weight || NO_DATA_DASH}
      </TableData>
      <TableData id="terms" activeColumnIDs={activeColumnIDs}>
        <div>{expressionsLabel}</div> <div>{fieldsLabel}</div>
      </TableData>
      <TableData id="" activeColumnIDs={activeColumnIDs} className="pf-c-table__action">
        <AffinityRowActionsDropdown affinity={affinity} onEdit={onEdit} onDelete={onDelete} />
      </TableData>
    </>
  );
};

export default AffinityRow;
