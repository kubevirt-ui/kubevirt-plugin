import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';

export const UNCATEGORIZED_VM = 'UNCATEGORIZED_VM';
export const UNCATEGORIZED_LABEL = 'Uncategorized';

export const TEMPLATE_FILTER_KEY = 'template';
export const INSTANCETYPE_FILTER_KEY = 'instanceType';

export const vmsPerResourceOptions = [
  {
    title: 'Show VirtualMachine per Templates',
    type: TemplateModel.kind,
  },
  {
    title: 'Show VirtualMachine per InstanceTypes',
    type: VirtualMachineClusterInstancetypeModel.kind,
  },
  {
    title: 'Show uncategorized VirtualMachines',
    type: UNCATEGORIZED_VM,
  },
];

export type ChartDataObject = {
  fill: string;
  x: string;
  y: number;
};
