import React, { FC } from 'react';

import { V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getMigrationRequiredConditionMessageParts } from './utils/utils';

type MigrationPendingChangesProps = {
  migrationRequiredCondition?: V1VirtualMachineCondition;
};

const MigrationPendingChanges: FC<MigrationPendingChangesProps> = ({
  migrationRequiredCondition,
}) => {
  const { t } = useKubevirtTranslation();
  const messageParts = getMigrationRequiredConditionMessageParts(t, migrationRequiredCondition);

  return (
    <span>
      {messageParts.map((part) => (
        <p key={part}>{part}</p>
      ))}
    </span>
  );
};

export default MigrationPendingChanges;
