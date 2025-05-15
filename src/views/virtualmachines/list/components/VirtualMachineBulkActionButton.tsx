import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';

import useExistingSelectedVMs from '../hooks/useExistingSelectedVMs';

type VirtualMachineBulkActionButtonProps = {
  vms: V1VirtualMachine[];
};

const VirtualMachineBulkActionButton: FC<VirtualMachineBulkActionButtonProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();

  const selectedVirtualMachines = useExistingSelectedVMs(vms);

  const actions = useMultipleVirtualMachineActions(selectedVirtualMachines);

  return (
    <ActionsDropdown
      actions={actions}
      disabledTooltip={t('Select multiple VirtualMachines to perform an action for all of them')}
      isDisabled={isEmpty(selectedVirtualMachines)}
      variant="secondary"
    />
  );
};

export default VirtualMachineBulkActionButton;
