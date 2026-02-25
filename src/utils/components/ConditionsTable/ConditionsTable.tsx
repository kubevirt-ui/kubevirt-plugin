import React, { FC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getConditionRowId, getConditionsColumns } from './conditionsTableDefinition';

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

export const ConditionsTable: FC<ConditionsProps> = ({ conditions }) => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(() => getConditionsColumns(t), [t]);

  if (isEmpty(conditions)) {
    return <div className="pf-v6-u-text-align-center">{t('No conditions found')}</div>;
  }

  return (
    <KubevirtTable
      ariaLabel={t('Conditions table')}
      columns={columns}
      data={conditions}
      getRowId={getConditionRowId}
      initialSortKey="type"
    />
  );
};

ConditionsTable.displayName = 'ConditionsTable';
