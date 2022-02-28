import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { VM_KUBEVIRT_OS_ANNOTATION } from './virtualMachinesInstancesConstants';
import { osNames, vmiStatuses } from './virtualMachinesInstancesStatuses';

const osTitles = {
  centos: 'CentOS',
  fedora: 'Fedora',
  windows: 'Windows',
  rhel: 'RHEL',
  other: 'Other',
};

const getOSName = (obj: V1VirtualMachineInstance): string | undefined => {
  const osAnnotation = obj?.metadata?.annotations?.[VM_KUBEVIRT_OS_ANNOTATION];
  const [osName] = osAnnotation?.split(/(\d.*)/) || [];
  return osTitles[osName] ? osName : 'other';
};

const includeFilter = (compareData: FilterValue, compareString: string) => {
  return (
    compareData.selected?.length === 0 ||
    compareData.selected?.includes(compareString) ||
    !compareData?.all?.find((s: string) => s === compareString)
  );
};

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Status',
    type: 'vmi-status',
    reducer: (obj) => obj?.status?.phase,
    filter: (statuses, obj) => includeFilter(statuses, obj?.status?.phase),
    items: Object.keys(vmiStatuses).map((status) => ({
      id: status,
      title: status,
    })),
  },
  {
    filterGroupName: 'OS',
    type: 'vmi-os',
    reducer: (obj) => getOSName(obj),
    filter: (availableOSNames, obj) => includeFilter(availableOSNames, getOSName(obj)),
    items: osNames.map((os) => ({
      id: os,
      title: osTitles[os] || osTitles.other,
    })),
  },
];
