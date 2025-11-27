import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import { VMIMMapper } from '@virtualmachines/utils/mappers';

import useExistingSelectedVMs from '../hooks/useExistingSelectedVMs';

type VirtualMachineBulkActionButtonProps = {
  vmimMapper: VMIMMapper;
  vms: V1VirtualMachine[];
};

const VirtualMachineBulkActionButton: FC<VirtualMachineBulkActionButtonProps> = ({
  vmimMapper,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const selectedVirtualMachines = useExistingSelectedVMs(vms);

  const actions = useMultipleVirtualMachineActions(selectedVirtualMachines, vmimMapper);

  return (
    <ActionsDropdown
      actions={actions}
      className="vm-actions-toggle"
      disabledTooltip={t('Select multiple VirtualMachines to perform an action for all of them')}
      isDisabled={isEmpty(selectedVirtualMachines)}
      variant="secondary"
    />
  );
};

export default VirtualMachineBulkActionButton;
