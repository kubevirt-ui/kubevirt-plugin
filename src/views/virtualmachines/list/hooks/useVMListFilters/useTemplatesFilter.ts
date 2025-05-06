import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { LABEL_USED_TEMPLATE_NAME } from '@kubevirt-utils/resources/template';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useTemplatesFilter = (vms: V1VirtualMachine[]): RowFilter => {
  const noTemplate = t('None');
  const templates = useMemo(
    () =>
      [
        ...new Set(
          (Array.isArray(vms) ? vms : [])?.map((vm) => {
            const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
            return templateName ?? noTemplate;
          }),
        ),
      ].map((template) => ({ id: template, title: template })),
    [vms, noTemplate],
  );

  return {
    filter: (selectedTemplates, obj) => {
      const templateName = obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate;
      return (
        selectedTemplates.selected?.length === 0 ||
        selectedTemplates.selected?.includes(templateName)
      );
    },
    filterGroupName: t('Template'),
    items: templates,
    reducer: (obj) => obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? noTemplate,
    type: VirtualMachineRowFilterType.Template,
  };
};
