import { useState } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCanEditResource from '@kubevirt-utils/hooks/useCanEditResource';
import { useDeschedulerInstalled } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import {
  isDeschedulerEnabled,
  updateDeschedulerForTemplate,
  updateDeschedulerForVM,
} from '@kubevirt-utils/hooks/useDeschedulerSetting/utils';
import {
  getTemplateModel,
  getTemplateVirtualMachineObject,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getVMTemplateAnnotations } from '@kubevirt-utils/resources/vm';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { getCluster } from '@multicluster/helpers/selectors';
import { isLiveMigratable } from '@virtualmachines/utils';

type UseDeschedulerSetting = (obj: Template | V1VirtualMachine) => {
  deschedulerEnabled: boolean;
  deschedulerSwitchDisabled: boolean;
  onDeschedulerChange: (checked: boolean) => Promise<Template | V1VirtualMachine>;
};

const useDeschedulerSetting: UseDeschedulerSetting = (obj) => {
  const isVMObj = isVM(obj);
  const resourceModel = isVMObj ? VirtualMachineModel : getTemplateModel(obj);
  const [canEditObj, canEditLoading] = useCanEditResource(resourceModel, obj);
  const isMigratable = isVMObj ? isLiveMigratable(obj) : true;
  const { isDeschedulerInstalled } = useDeschedulerInstalled(getCluster(obj));

  const vm = isVM(obj) ? obj : getTemplateVirtualMachineObject(obj);
  const annotations = getVMTemplateAnnotations(vm);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isDeschedulerEnabled(annotations));

  const onDeschedulerChange = (checked: boolean): Promise<Template | V1VirtualMachine> => {
    setIsEnabled(checked);
    return isVMObj
      ? updateDeschedulerForVM(obj, checked)
      : updateDeschedulerForTemplate(obj, checked);
  };

  return {
    deschedulerEnabled: isEnabled,
    deschedulerSwitchDisabled:
      canEditLoading || !canEditObj || !isDeschedulerInstalled || !isMigratable,
    onDeschedulerChange,
  };
};

export default useDeschedulerSetting;
