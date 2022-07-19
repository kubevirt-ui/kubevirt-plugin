import * as React from 'react';

import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import { ConditionsTableRow } from './components/ConditionsTableRow';
import useConditionsTableColumns from './components/useConditionsTableColumns';

export enum K8sResourceConditionStatus {
  True = 'True',
  False = 'False',
  Unknown = 'Unknown',
}

export type K8sResourceCondition = {
  type: string;
  status: keyof typeof K8sResourceConditionStatus;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
};

export type ConditionsProps = {
  conditions: K8sResourceCondition[];
};

export const ConditionsTable: React.FC<ConditionsProps> = ({ conditions }) => {
  const columns = useConditionsTableColumns();
  const isValidConditions = React.useMemo(() => conditions?.some((c) => !!c.type), [conditions]);

  return isValidConditions ? (
    <VirtualizedTable<K8sResourceCondition>
      data={conditions}
      unfilteredData={conditions}
      loaded
      loadError={null}
      columns={columns}
      Row={ConditionsTableRow}
    />
  ) : null;
};
ConditionsTable.displayName = 'ConditionsTable';
