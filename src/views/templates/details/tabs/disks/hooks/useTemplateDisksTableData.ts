import useWizardDisksTableData from '@catalog/wizard/tabs/disks/hooks/useWizardDisksTableData';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';

type UseDisksTableDisks = (template: V1Template) => [DiskRowDataLayout[], boolean, any];

/**
 * A Hook for getting disks data for a VM template
 * @param template - VM template to get disks from
 * @returns disks data and loading state
 */
const useTemplateDisksTableData: UseDisksTableDisks = (template) => {
  const vm = getTemplateVirtualMachineObject(template);

  const data = useWizardDisksTableData(vm, getNamespace(template));
  return data;
};

export default useTemplateDisksTableData;
