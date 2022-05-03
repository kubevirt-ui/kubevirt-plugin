import { TFunction } from 'i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  LABEL_USED_TEMPLATE_NAME,
  OS_NAME_LABELS,
} from '@kubevirt-utils/resources/template';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
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
  const other = t('Other');
  const templates = vms.reduce((acc, vm) => {
    const templateName = vm.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
    if (templateName) {
      acc.add(templateName);
    } else {
      acc.add(other);
    }
    return acc;
  }, new Set<string>());

  return [
    {
      filterGroupName: t('Template'),
      type: 'template',
      reducer: (obj) => obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? other,
      filter: (selectedTemplates, obj) => {
        const templateName = obj?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME] ?? other;
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

export const getNodesFilter = (vmis: V1VirtualMachineInstance[], t: TFunction): RowFilter[] => {
  if (vmis?.length === 0 || vmis?.every((vm) => !vm.status?.nodeName)) {
    return [] as RowFilter[];
  }

  const nodes = vmis.reduce((acc, vmi) => {
    const nodeName = vmi?.status?.nodeName;
    if (nodeName) {
      acc.add(nodeName);
    }
    return acc;
  }, new Set<string>());

  return [
    {
      filterGroupName: t('Node'),
      type: 'node',
      reducer: (obj) => {
        return vmis?.find((vmi) => vmi.metadata?.name === obj?.metadata?.name)?.status?.nodeName;
      },
      filter: (selectedNodes, obj) => {
        const nodeName = vmis?.find((vmi) => vmi.metadata?.name === obj?.metadata?.name)?.status
          ?.nodeName;
        return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
      },
      items: Array.from(nodes).map((nodeName) => ({
        id: nodeName,
        title: nodeName,
      })),
    },
  ];
};

export const getOSFilter = (vms: V1VirtualMachine[], t: TFunction): RowFilter[] => {
  return [
    {
      filterGroupName: t('OS'),
      type: 'os',
      reducer: (obj) => {
        const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
        const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
        const osName = Object.values(OS_NAME_LABELS).find(
          (osKey) =>
            osAnnotation?.toLowerCase()?.startsWith(osKey?.toLowerCase()) ||
            osLabel?.toLowerCase()?.startsWith(osKey?.toLowerCase()),
        );
        return osName;
      },
      filter: (selectedOS, obj) => {
        const osAnnotation = getAnnotation(obj?.spec?.template, ANNOTATIONS.os);
        const osLabel = getOperatingSystemName(obj) || getOperatingSystem(obj);
        const osName = Object.values(OS_NAME_LABELS).find(
          (osKey) =>
            osAnnotation?.toLowerCase()?.startsWith(osKey?.toLowerCase()) ||
            osLabel?.toLowerCase()?.startsWith(osKey?.toLowerCase()),
        );
        return selectedOS.selected?.length === 0 || selectedOS.selected?.includes(osName);
      },
      items: Object.values(OS_NAME_LABELS).map((osName) => ({
        id: osName,
        title: osName,
      })),
    },
  ];
};
