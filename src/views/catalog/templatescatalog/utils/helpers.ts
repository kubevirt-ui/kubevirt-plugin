import produce from 'immer';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import {
  getTemplateName,
  getTemplateOS,
  getTemplateWorkload,
  isCustomTemplate,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { TemplateFilters } from '../hooks/useVmTemplatesFilters';

export const filterTemplates = (templates: V1Template[], filters: TemplateFilters): V1Template[] =>
  templates
    .filter((tmp) => {
      const textFilterLowerCase = filters?.query.toLowerCase();
      const workload = getTemplateWorkload(tmp);

      const textFilter = textFilterLowerCase
        ? getTemplateName(tmp).toLowerCase().includes(textFilterLowerCase) ||
          tmp?.metadata?.name?.includes(textFilterLowerCase)
        : true;

      const defaultVariantFilter = filters?.onlyDefault
        ? isDefaultVariantTemplate(tmp) || isCustomTemplate(tmp)
        : true;

      const workloadFilter = filters?.workload?.size > 0 ? filters.workload.has(workload) : true;

      const osNameFilter =
        filters?.osName?.size > 0 ? filters?.osName?.has(getTemplateOS(tmp)) : true;

      return defaultVariantFilter && textFilter && workloadFilter && osNameFilter;
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
      ensurePath(vmDraft, ['spec.template.spec.domain.resources', 'spec.template.spec.domain.cpu']);

      vmDraft.metadata.namespace = ns || DEFAULT_NAMESPACE;
      vmDraft.spec.template.spec.domain.resources.requests = {
        ...vmDraft?.spec?.template?.spec?.domain?.resources?.requests,
        memory: `${vm.spec.template.spec.domain.resources.requests['memory']}`,
      };
      vmDraft.spec.template.spec.domain.cpu.cores = vm.spec.template.spec.domain.cpu.cores;
    });

    setUpdatedVM(updatedVM);

    return updateVM(updatedVM);
  };
};
