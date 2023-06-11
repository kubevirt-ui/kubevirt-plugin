import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { osNames, vmiStatuses } from '@kubevirt-utils/resources/vmi';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { VM_KUBEVIRT_OS_ANNOTATION } from './virtualMachinesInstancesConstants';

const osTitles = {
  centos: 'CentOS',
  fedora: 'Fedora',
  other: 'Other',
  rhel: 'RHEL',
  windows: 'Windows',
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
    filter: (statuses, obj) => includeFilter(statuses, obj?.status?.phase),
    filterGroupName: 'Status',
    items: Object.keys(vmiStatuses).map((status) => ({
      id: status,
      title: status,
    })),
    reducer: (obj) => obj?.status?.phase,
    type: 'vmi-status',
  },
  {
    filter: (availableOSNames, obj) => includeFilter(availableOSNames, getOSName(obj)),
    filterGroupName: 'OS',
    items: osNames.map((os) => ({
      id: os,
      title: osTitles[os] || osTitles.other,
    })),
    reducer: (obj) => getOSName(obj),
    type: 'vmi-os',
  },
];
