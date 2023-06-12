import shuffle from 'lodash.shuffle';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { getInstanceTypePrefix } from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { LightMultiColorOrderedTheme } from '@patternfly/react-charts/dist/js/components/ChartTheme/themes/light/multi-color-ordered-theme';

import { RunningVMsChartLegendLabelItem } from '../RunningVMsChartLegendLabel';

import { ChartDataObject } from './constants';

const swapArrayElems = (arr) => ([arr[0], arr[1]] = [arr[1], arr[0]]);

export const getColorList = (numColors: number) => {
  const originalColors = LightMultiColorOrderedTheme.pie.colorScale;
  const numOriginalColors = originalColors.length;
  const colorList = [].concat(originalColors);

  if (numColors > numOriginalColors) {
    // assemble an array of the required size by repeating colors
    const fullMultiples = numColors / numOriginalColors;
    const remainder = numColors % numOriginalColors;

    // add full shuffled copies of the original list
    for (let i = 1; i <= fullMultiples; i++) {
      const shuffledColors = shuffle([].concat(originalColors));
      if (shuffledColors[0] === colorList[colorList.length - 1]) {
        // swap colors to avoid adjoining colors being equal
        swapArrayElems(shuffledColors);
      }
      colorList.concat(shuffledColors);
    }

    // add a shuffled slice of the original list to meet length requirement
    if (remainder) {
      const shuffledRemainder = shuffle(originalColors.slice(0, remainder));
      if (remainder > 1 && shuffledRemainder[0] === colorList[colorList.length - 1]) {
        // swap colors to avoid adjoining colors being equal
        swapArrayElems(shuffledRemainder);
      }
      colorList.concat(shuffledRemainder);
    }
  }

  return colorList;
};

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

export const getResourcesToVMCountMap = (
  loaded: boolean,
  vms: V1VirtualMachine[],
  type: string,
): Map<string, RunningVMsChartLegendLabelItem> => {
  const resourcesToVMCountMap = new Map();
  const isTemplate = type === TemplateModel.kind;

  if (loaded) {
    vms.forEach((vm) => {
      const template = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
      const templateNamespace = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAMESPACE];
      const instanceType = vm?.spec?.instancetype?.name;
      const resource = isTemplate ? template : instanceType;

      if (resource) {
        const newResourceName = isTemplate ? resource : getInstanceTypePrefix(resource);
        const value = resourcesToVMCountMap.has(newResourceName)
          ? resourcesToVMCountMap.get(newResourceName).vmCount + 1
          : 1;
        resourcesToVMCountMap.set(newResourceName, {
          isInstanceType: Boolean(vm?.spec?.instancetype),
          templateNamespace,
          vmCount: value,
        });
      }
    });
    const numResources = resourcesToVMCountMap.size;
    const colorListIter = getColorList(numResources).values();
    const totalPerResource = vmsPerResourceCount(resourcesToVMCountMap);

    for (const key of resourcesToVMCountMap.keys()) {
      const resourceChartData = resourcesToVMCountMap.get(key);
      const additionalData = {
        color: colorListIter.next().value,
        percentage: Math.round((100 / totalPerResource) * resourceChartData.vmCount),
      };
      resourcesToVMCountMap.set(key, { ...resourceChartData, ...additionalData });
    }
  }

  return resourcesToVMCountMap;
};

export const vmsPerResourceCount = (resourceToVMCountMap): number =>
  [...resourceToVMCountMap?.values()]?.reduce((total, { vmCount }) => total + vmCount, 0);
