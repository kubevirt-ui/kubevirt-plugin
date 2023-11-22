import * as React from 'react';

import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import { ConditionsTableRow } from './components/ConditionsTableRow';
import useConditionsTableColumns from './components/useConditionsTableColumns';

export enum K8sResourceConditionStatus {
  False = 'False',
  True = 'True',
  Unknown = 'Unknown',
}

export type K8sResourceCondition = {
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  status: keyof typeof K8sResourceConditionStatus;
  type: string;
};

export type ConditionsProps = {
  conditions: K8sResourceCondition[];
};

export const ConditionsTable: React.FC<ConditionsProps> = ({ conditions }) => {
  const columns = useConditionsTableColumns();
  const mutatedConditions = React.useMemo(() => [...(conditions || [])], [conditions]);

  return (
    <VirtualizedTable<K8sResourceCondition>
      columns={columns}
      data={mutatedConditions}
      loaded
      loadError={null}
      Row={ConditionsTableRow}
      unfilteredData={mutatedConditions}
    />
  );
};
ConditionsTable.displayName = 'ConditionsTable';
