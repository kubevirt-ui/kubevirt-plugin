import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';

import { RunningVMsChartLegendLabelItem } from '../RunningVMsChartLegendLabel';

import {
  ChartDataObject,
  INSTANCETYPE_FILTER_KEY,
  TEMPLATE_FILTER_KEY,
  UNCATEGORIZED_LABEL,
  UNCATEGORIZED_VM,
} from './constants';

export const getInstanceTypeSeriesLabel = (instanceTypeName: string): string => {
  const seriesName = getInstanceTypePrefix(instanceTypeName);
  const seriesLabel = instanceTypeSeriesNameMapper[seriesName];
  return seriesLabel?.seriesLabel || instanceTypeName;
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

export const getResourcesToVMCountMap = (
  loaded: boolean,
  vms: V1VirtualMachine[],
  type: string,
): Map<string, RunningVMsChartLegendLabelItem> => {
  const resourcesToVMCountMap = new Map();
  const isTemplate = type === TemplateModel.kind;

  if (loaded) {
    vms.forEach((vm) => {
      const templateName = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
      const templateNamespace = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAMESPACE];
      const instanceType = vm?.spec?.instancetype?.name;
      const resourceName = isTemplate ? templateName : getInstanceTypePrefix(instanceType);
      const resourceType = getResourceType(templateName, instanceType);

      if (resourceType === type) {
        const newResourceName = Boolean(resourceName) ? resourceName : UNCATEGORIZED_LABEL;
        const value = resourcesToVMCountMap.has(newResourceName)
          ? resourcesToVMCountMap.get(newResourceName).vmCount + 1
          : 1;
        resourcesToVMCountMap.set(newResourceName, {
          isInstanceType: Boolean(vm?.spec?.instancetype),
          templateNamespace,
          type,
          vmCount: value,
        });
      }
    });
    const totalPerResource = vmsPerResourceCount(resourcesToVMCountMap);

    for (const key of resourcesToVMCountMap.keys()) {
      const resourceChartData = resourcesToVMCountMap.get(key);
      const additionalData = {
        percentage: Math.round((100 / totalPerResource) * resourceChartData.vmCount),
      };
      resourcesToVMCountMap.set(key, { ...resourceChartData, ...additionalData });
    }
  }

  return resourcesToVMCountMap;
};

export const vmsPerResourceCount = (resourceToVMCountMap): number =>
  [...resourceToVMCountMap?.values()]?.reduce((total, { vmCount }) => total + vmCount, 0);

export const getFilterKey = (resourceItem: RunningVMsChartLegendLabelItem) => {
  if (resourceItem.type === UNCATEGORIZED_VM) return null;
  return resourceItem.isInstanceType ? INSTANCETYPE_FILTER_KEY : TEMPLATE_FILTER_KEY;
};
