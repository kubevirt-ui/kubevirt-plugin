import React, { FC, useMemo } from 'react';

import { V1Condition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getConditionRowId, getConditionsColumns } from './conditionsTableDefinition';

export type ConditionsProps = {
  conditions?: V1Condition[];
};

export const ConditionsTable: FC<ConditionsProps> = ({ conditions = [] }) => {
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
