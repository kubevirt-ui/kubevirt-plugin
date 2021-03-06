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
  const mutatedConditions = React.useMemo(() => [...(conditions || [])], [conditions]);

  return (
    <VirtualizedTable<K8sResourceCondition>
      data={mutatedConditions}
      unfilteredData={mutatedConditions}
      loaded
      loadError={null}
      columns={columns}
      Row={ConditionsTableRow}
    />
  );
};
ConditionsTable.displayName = 'ConditionsTable';
