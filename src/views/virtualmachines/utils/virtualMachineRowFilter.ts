import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { LABEL_USED_TEMPLATE_NAME } from '@kubevirt-utils/resources/template';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { printableVMStatus } from './virtualMachineStatuses';

export const getStatusFilter = (t: TFunction): RowFilter[] => [
  {
    filterGroupName: t('Status'),
    type: 'status',
    reducer: (obj) => obj?.status?.printableStatus,
    filter: (statuses, obj) => {
      const status = obj?.status?.printableStatus;
      return (
        statuses.selected?.length === 0 ||
        statuses.selected?.includes(status) ||
        !statuses?.all?.find((s) => s === status)
      );
    },
    items: Object.keys(printableVMStatus).map((status) => ({
      id: status,
      title: status,
    })),
  },
];

export const getTemplatesFilter = (vms: V1VirtualMachine[], t: TFunction): RowFilter[] => {
  const templates = vms.reduce((acc, vm) => {
    const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
    if (templateName) {
      acc.add(templateName);
    }
    return acc;
  }, new Set<string>());

  return [
    {
      filterGroupName: t('Template'),
      type: 'template',
      reducer: (obj) => obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME],
      filter: (selectedTemplates, obj) => {
        const templateName = obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
        return (
          selectedTemplates.selected?.length === 0 ||
          selectedTemplates.selected?.includes(templateName)
        );
      },
      items: Array.from(templates).map((templateName) => ({
        id: templateName,
        title: templateName,
      })),
    },
  ];
};
