import React, { FC } from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useMigrationPoliciesActionsProvider from '../hooks/useMigrationPoliciesActionsProvider';

type MigrationPoliciesActionsProps = {
  isKebabToggle?: boolean;
  mp: V1alpha1MigrationPolicy;
};

const MigrationPoliciesActions: FC<MigrationPoliciesActionsProps> = ({ isKebabToggle, mp }) => {
  const [actions] = useMigrationPoliciesActionsProvider(mp);

  return (
    <ActionsDropdown
      actions={actions}
      id="migration-policies-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default MigrationPoliciesActions;
