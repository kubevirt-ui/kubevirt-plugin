import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import useWizardDisksTableData from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/useWizardDisksTableData';

type UseDisksTableDisks = (template: Template) => [DiskRowDataLayout[], boolean, Error | null];

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
