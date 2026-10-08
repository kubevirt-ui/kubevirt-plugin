import { useCallback } from 'react';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

const useTemplateVMSubmit = (
  template: Template,
  onSubmit: (updatedTemplate: Template) => Promise<Template | void>,
): ((updatedVM: V1VirtualMachine) => Promise<void>) =>
  useCallback(
    async (updatedVM: V1VirtualMachine) => {
      const updatedTemplate = produce(template, (draft) => {
        const draftVM = getTemplateVirtualMachineObject(draft);
        ensurePath(draftVM, 'spec.template.spec');
        Object.assign(draftVM.spec.template.spec, updatedVM.spec.template.spec);
      });
      await onSubmit(updatedTemplate);
    },
    [template, onSubmit],
  );

export default useTemplateVMSubmit;
