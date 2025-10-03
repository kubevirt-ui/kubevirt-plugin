export const VM_FILTER_OPTIONS = {
  labels: 'metadata.labels',
  name: 'metadata.name',
  'rowFilter-os': 'spec.template.metadata.annotations.vm\\.kubevirt\\.io/os',
  'rowFilter-status': 'status.printableStatus',
} as const;

export const VMI_FILTER_OPTIONS = {
  ip: 'status.interfaces',
  'rowFilter-node': 'status.nodeName',
} as const;
