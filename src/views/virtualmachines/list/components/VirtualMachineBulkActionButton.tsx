import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';

import { selectedVMs } from '../selectedVMs';

type VirtualMachineBulkActionButtonProps = {
  vms: V1VirtualMachine[];
};
const VirtualMachineBulkActionButton: FC<VirtualMachineBulkActionButtonProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();

  const selectedVirtualMachines = useMemo(() => {
    const vmsMapper = convertResourceArrayToMap(vms, true);
    return selectedVMs.value.map(
      (selectedVM) => vmsMapper?.[selectedVM.namespace]?.[selectedVM.name],
    );
  }, [vms]);

  const actions = useMultipleVirtualMachineActions(selectedVirtualMachines);

  return (
    <ActionsDropdown
      actions={actions}
      disabledTooltip={t('Select multiple VirtualMachines to perform an action for all of them')}
      isDisabled={isEmpty(selectedVMs.value)}
      variant="secondary"
    />
  );
};

export default VirtualMachineBulkActionButton;
