import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import LazyActionMenu from '@kubevirt-utils/components/LazyActionMenu/LazyActionMenu';
import {
  checkAccessForFleet,
  createLocalMenuOptions,
} from '@kubevirt-utils/components/LazyActionMenu/overrides';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ActionMenuVariant } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import useMultipleVirtualMachineActions from '@virtualmachines/actions/hooks/useMultipleVirtualMachineActions';
import { VMIMMapper } from '@virtualmachines/utils/mappers';

import useExistingSelectedVMs from '../hooks/useExistingSelectedVMs';

type VirtualMachineBulkActionButtonProps = {
  vmimMapper: VMIMMapper;
  vms: V1VirtualMachine[];
};

const VirtualMachineModelRefArray = `${VirtualMachineModelRef}[]`;

const VirtualMachineBulkActionButton: FC<VirtualMachineBulkActionButtonProps> = ({
  vmimMapper,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedVirtualMachines = useExistingSelectedVMs(vms);

  const actions = useMultipleVirtualMachineActions(selectedVirtualMachines, vmimMapper);

  const localOptions = useMemo(() => createLocalMenuOptions(actions), [actions]);
  const context = useMemo(
    () => ({ [VirtualMachineModelRefArray]: selectedVirtualMachines }),
    [selectedVirtualMachines],
  );

  return (
    <LazyActionMenu
      checkAccessDelegate={checkAccessForFleet}
      context={context}
      disabledTooltip={t('Select multiple VirtualMachines to perform an action for all of them')}
      isDisabled={isEmpty(selectedVirtualMachines)}
      localOptions={localOptions}
      variant={ActionMenuVariant.DROPDOWN}
    />
  );
};

export default VirtualMachineBulkActionButton;
