import React, { FC } from 'react';

import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import useClusterPreferenceActionsProvider from './hooks/useClusterPreferenceActionsProvider';

type ClusterPreferenceActionsProps = {
  isKebabToggle?: boolean;
  preference: V1beta1VirtualMachineClusterPreference;
};

const ClusterPreferenceActions: FC<ClusterPreferenceActionsProps> = ({
  isKebabToggle,
  preference,
}) => {
  const [actions] = useClusterPreferenceActionsProvider(preference);

  return (
    <ActionsDropdown
      actions={actions}
      id="virtual-machine-cluster-preference-actions"
      isKebabToggle={isKebabToggle}
    />
  );
};

export default ClusterPreferenceActions;
