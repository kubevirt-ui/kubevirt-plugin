import React, { FC } from 'react';

import { V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getMigrationRequiredConditionMessage } from './utils/utils';

type MigrationPendingChangesProps = {
  migrationRequiredCondition?: V1VirtualMachineCondition;
};

const MigrationPendingChanges: FC<MigrationPendingChangesProps> = ({
  migrationRequiredCondition,
}) => {
  const { t } = useKubevirtTranslation();

  return <p>{getMigrationRequiredConditionMessage(t, migrationRequiredCondition)}</p>;
};

export default MigrationPendingChanges;
