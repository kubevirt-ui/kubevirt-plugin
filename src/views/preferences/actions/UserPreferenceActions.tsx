import React, { FCC } from 'react';

import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useUserPreferenceActionsProvider from './hooks/useUserPreferenceActionsProvider';

type UserPreferenceActionsProps = {
  isKebabToggle?: boolean;
  preference: V1beta1VirtualMachinePreference;
};

const UserPreferenceActions: FCC<UserPreferenceActionsProps> = ({ isKebabToggle, preference }) => {
  const actions = useUserPreferenceActionsProvider(preference);
  return (
    <ActionsDropdown
      actions={actions}
      id="virtual-machine-preference-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default UserPreferenceActions;
