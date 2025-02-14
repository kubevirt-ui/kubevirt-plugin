import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';

type VirtualMachineBulkActionButtonProps = {
  vms: V1VirtualMachine[];
};
const VirtualMachineBulkActionButton: FC<VirtualMachineBulkActionButtonProps> = ({ vms }) => {
  const actions = useMultipleVirtualMachineActions(vms);
  const { t } = useKubevirtTranslation();

  return (
    <ActionsDropdown
      actions={actions}
      disabledTooltip={t('No VirtualMachines')}
      isDisabled={isEmpty(vms)}
      isKebabToggle
      variant="secondary"
    />
  );
};

export default VirtualMachineBulkActionButton;
