import type { FC } from 'react';

import type { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';

import type { BootableResource } from '../utils/types';
import useBootableVolumesActions from './hooks/useBootableVolumesActions';

type BootableVolumesActionsProps = {
  preferences: V1beta1VirtualMachineClusterPreference[];
  source: BootableResource;
};

const BootableVolumesActions: FC<BootableVolumesActionsProps> = ({ preferences, source }) => {
  const [actions] = useBootableVolumesActions(source, preferences);

  return <ActionsDropdown actions={actions} id="bootable-volumes-actions" isKebabToggle />;
};

export default BootableVolumesActions;
