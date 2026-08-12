import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getVMListPathWithFilters } from '@kubevirt-utils/resources/vm/utils/utils';

import { type RunningVMsChartLegendLabelItem } from '../RunningVMsChartLegendLabel';

import {
  type ChartDataObject,
  INSTANCETYPE_FILTER_KEY,
  TEMPLATE_FILTER_KEY,
  UNCATEGORIZED_LABEL,
  UNCATEGORIZED_VM,
} from './constants';

export const getInstanceTypeSeriesLabel = (instanceTypeName: string): string => {
  const seriesName = getInstanceTypePrefix(instanceTypeName);
  return seriesName in instanceTypeSeriesNameMapper ? seriesName : instanceTypeName;
};

export const getChartData = (
  resourceToVMCountMap: Map<string, RunningVMsChartLegendLabelItem>,
): ChartDataObject[] => {
  const chartData = Array.from(resourceToVMCountMap).map(([resourceName, data]) => {
    const name = data.isInstanceType ? getInstanceTypePrefix(resourceName) : resourceName;
    return {
      fill: data.color,
      x: name,
      y: data.percentage,
    };
  });
  return chartData;
};

export const getResourceLegendItems = (
  resourceToVMCountMap: Map<string, RunningVMsChartLegendLabelItem>,
): RunningVMsChartLegendLabelItem[] => {
  const legendItems = Array.from(resourceToVMCountMap).map(([resourceName, data]) => {
    const name = data?.isInstanceType ? getInstanceTypePrefix(resourceName) : resourceName;
    return {
      name,
      ...data,
    };
  });
  return legendItems;
};

export const getResourceType = (templateName: string, instanceTypeName: string): string => {
  const isTemplate = Boolean(templateName);
  const isInstanceType = Boolean(instanceTypeName);

  if (!isTemplate && !isInstanceType) return UNCATEGORIZED_VM;
  return isTemplate ? TemplateModel.kind : VirtualMachineClusterInstancetypeModel.kind;
};

type PartialItem = Partial<RunningVMsChartLegendLabelItem> & { vmCount: number };

const countVMsPerResource = (vms: V1VirtualMachine[], type: string): Map<string, PartialItem> => {
  const countMap = new Map<string, PartialItem>();
  const isTemplate = type === TemplateModel.kind;

  for (const vm of vms) {
    const templateName = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
    const templateNamespace = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAMESPACE];
    const instanceType = vm?.spec?.instancetype?.name;
    const resourceName = isTemplate ? templateName : getInstanceTypePrefix(instanceType);
    const resourceType = getResourceType(templateName, instanceType);

    if (resourceType !== type) continue;

    const newResourceName = Boolean(resourceName) ? resourceName : UNCATEGORIZED_LABEL;
    const existing = countMap.get(newResourceName);
    countMap.set(newResourceName, {
      isInstanceType: Boolean(vm?.spec?.instancetype),
      templateNamespace,
      type,
      vmCount: existing ? existing.vmCount + 1 : 1,
    });
  }
  return countMap;
};

export const getResourcesToVMCountMap = (
  loaded: boolean,
  vms: V1VirtualMachine[],
  type: string,
): Map<string, RunningVMsChartLegendLabelItem> => {
  if (!loaded) {
    return new Map<string, RunningVMsChartLegendLabelItem>();
  }

  const resourcesToVMCountMap = countVMsPerResource(vms, type);
  const totalPerResource = vmsPerResourceCount(resourcesToVMCountMap);

  for (const [key, resourceChartData] of resourcesToVMCountMap.entries()) {
    const percentage = Math.round((100 / totalPerResource) * resourceChartData.vmCount);
    resourcesToVMCountMap.set(key, { ...resourceChartData, percentage });
  }

  return resourcesToVMCountMap as unknown as Map<string, RunningVMsChartLegendLabelItem>;
};

export const vmsPerResourceCount = (
  resourceToVMCountMap: Map<string, { vmCount: number }>,
): number =>
  [...resourceToVMCountMap?.values()]?.reduce((total, { vmCount }) => total + vmCount, 0);

export const getFilterKey = (
  resourceItem: RunningVMsChartLegendLabelItem,
): 'instanceType' | 'template' => {
  if (resourceItem.type === UNCATEGORIZED_VM) return null;
  return resourceItem.isInstanceType ? INSTANCETYPE_FILTER_KEY : TEMPLATE_FILTER_KEY;
};

export const getLinkPath = (
  resourceItem: RunningVMsChartLegendLabelItem,
  namespace: string,
  cluster?: string,
): string => {
  const filterKey = getFilterKey(resourceItem);
  const filters =
    resourceItem?.type === UNCATEGORIZED_VM
      ? { instanceType: 'No+InstanceType', template: 'None' }
      : { [filterKey]: getInstanceTypePrefix(resourceItem.name) };

  return getVMListPathWithFilters(namespace, filters, cluster);
};
