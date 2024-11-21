import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const UNCATEGORIZED_VM = 'UNCATEGORIZED_VM';
export const UNCATEGORIZED_LABEL = 'Uncategorized';

export const TEMPLATE_FILTER_KEY = 'template';
export const INSTANCETYPE_FILTER_KEY = 'instanceType';

export const vmsPerResourceOptions = [
  {
    title: t('Show VirtualMachine per Templates'),
    type: TemplateModel.kind,
  },
  {
    title: t('Show VirtualMachine per InstanceTypes'),
    type: VirtualMachineClusterInstancetypeModel.kind,
  },
  {
    title: t('Show uncategorized VirtualMachines'),
    type: UNCATEGORIZED_VM,
  },
];

export type ChartDataObject = {
  fill: string;
  x: string;
  y: number;
};
