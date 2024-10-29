import React, { FC } from 'react';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';

import { selectedVMs } from '../selectedVMs';

const VirtualMachineActionButton: FC = () => {
  const actions = useMultipleVirtualMachineActions(selectedVMs.value);

  return (
    <ActionsDropdown
      actions={actions}
      disabledTooltip={t('Select multiple VirtualMachines to perform an action for all of them')}
      isDisabled={isEmpty(selectedVMs.value)}
      variant="secondary"
    />
  );
};

export default VirtualMachineActionButton;
