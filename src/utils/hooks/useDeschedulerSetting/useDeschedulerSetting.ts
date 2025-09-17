import { useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import {
  isDeschedulerEnabled,
  updateDeschedulerForTemplate,
  updateDeschedulerForVM,
} from '@kubevirt-utils/hooks/useDeschedulerSetting/utils';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getVMTemplateAnnotations } from '@kubevirt-utils/resources/vm';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { isLiveMigratable } from '@virtualmachines/utils';

type UseDeschedulerSetting = (obj: V1Template | V1VirtualMachine) => {
  deschedulerEnabled: boolean;
  deschedulerSwitchDisabled: boolean;
  onDeschedulerChange: (checked: boolean) => Promise<V1Template | V1VirtualMachine>;
};

const useDeschedulerSetting: UseDeschedulerSetting = (obj) => {
  const isAdmin = useIsAdmin();
  const isVMObj = isVM(obj);
  const isMigratable = isVMObj ? isLiveMigratable(obj) : true;
  const isDeschedulerInstalled = useDeschedulerInstalled();

  const vm = isVM(obj) ? obj : getTemplateVirtualMachineObject(obj);
  const annotations = getVMTemplateAnnotations(vm);
  const [isEnabled, setIsEnabled] = useState<boolean>(isDeschedulerEnabled(annotations));

  const onDeschedulerChange = (checked: boolean) => {
    setIsEnabled(checked);
    return isVMObj
      ? updateDeschedulerForVM(obj, checked)
      : updateDeschedulerForTemplate(obj, checked);
  };

  return {
    deschedulerEnabled: isEnabled,
    deschedulerSwitchDisabled: !isAdmin || !isDeschedulerInstalled || !isMigratable,
    onDeschedulerChange,
  };
};

export default useDeschedulerSetting;
