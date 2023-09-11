import produce from 'immer';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isCommonTemplate, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import {
  getTemplateName,
  getTemplateOS,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getMemoryCPU } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { TemplateFilters } from './types';

const isUserTemplate = (template: V1Template): boolean =>
  !isDefaultVariantTemplate(template) && !isCommonTemplate(template);

export const filterTemplates = (templates: V1Template[], filters: TemplateFilters): V1Template[] =>
  templates
    .filter((tmp) => {
      const textFilterLowerCase = filters?.query.toLowerCase();
      const workload = getTemplateWorkload(tmp);

      const textFilter =
        !textFilterLowerCase ||
        getTemplateName(tmp).toLowerCase().includes(textFilterLowerCase) ||
        tmp?.metadata?.name?.includes(textFilterLowerCase);

      const defaultVariantFilter =
        (!filters?.onlyDefault && !hasNoDefaultUserAllFilters(filters)) ||
        isDefaultVariantTemplate(tmp);

      const userFilter = !filters.onlyUser || isUserTemplate(tmp);

      const workloadFilter = filters?.workload?.size <= 0 || filters.workload.has(workload);

      const osNameFilter = filters?.osName?.size <= 0 || filters?.osName?.has(getTemplateOS(tmp));

      return defaultVariantFilter && userFilter && textFilter && workloadFilter && osNameFilter;
    })
    // show RHEL templates first, then alphabetically
    .sort((a, b) => {
      if (getTemplateOS(a) === OS_NAME_TYPES.rhel) {
        return -1;
      }
      if (getTemplateOS(b) === OS_NAME_TYPES.rhel) {
        return 1;
      }

      const aName = getTemplateName(a) || a?.metadata?.name;
      const bName = getTemplateName(b) || b?.metadata?.name;

      return aName?.localeCompare(bName);
    });

export const updateVMCPUMemory = (
  ns: string,
  updateVM: UpdateValidatedVM,
  setUpdatedVM?: (value: React.SetStateAction<V1VirtualMachine>) => void,
) => {
  return (vm: V1VirtualMachine) => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      vmDraft.metadata.namespace = ns || DEFAULT_NAMESPACE;
      const { cpu, memory } = getMemoryCPU(vm);
      vmDraft.spec.template.spec.domain.cpu.cores = cpu?.cores;
      vmDraft.spec.template.spec.domain.memory.guest = memory;
    });

    setUpdatedVM(updatedVM);

    return updateVM(updatedVM);
  };
};

export const hasNoDefaultUserAllFilters = (filters: TemplateFilters): boolean =>
  !filters?.allItems && !filters?.onlyDefault && !filters?.onlyUser; // none of the filters are set - when first time in
