import shuffle from 'lodash.shuffle';

import { get } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { LightMultiColorOrderedTheme } from '@patternfly/react-charts/dist/js/components/ChartTheme/themes/light/multi-color-ordered-theme';

import { LABEL_USED_TEMPLATE_NAME } from './constants';
import { RunningVMsChartLegendLabelItem } from './RunningVMsChartLegendLabel';

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

export const getName = <A extends K8sResourceCommon = K8sResourceCommon>(value: A) =>
  get(value, 'metadata.name') as K8sResourceCommon['metadata']['name'];

export const getNamespace = <A extends K8sResourceCommon = K8sResourceCommon>(value: A) =>
  get(value, 'metadata.namespace') as K8sResourceCommon['metadata']['namespace'];

const getTemplateNS = (templateName, templates) => {
  const template = templates.find((temp) => getName(temp) === templateName);
  return template ? getNamespace(template) : null;
};

export const getTemplateToVMCountMap = (loaded, vms, templates) => {
  const templateToVMCountMap = new Map();
  const numVMs = vms.length;

  if (loaded) {
    vms.forEach((vm) => {
      const template = vm?.metadata?.labels?.[LABEL_USED_TEMPLATE_NAME];
      if (template) {
        const value = templateToVMCountMap.has(template)
          ? templateToVMCountMap.get(template).vmCount + 1
          : 1;
        templateToVMCountMap.set(template, { vmCount: value });
      }
    });
  }

  const numTemplates = templateToVMCountMap.size;
  const colorListIter = getColorList(numTemplates).values();

  for (const key of templateToVMCountMap.keys()) {
    const templateChartData = templateToVMCountMap.get(key);
    const additionalData = {
      color: colorListIter.next().value,
      namespace: getTemplateNS(key, templates),
      percentage: Math.round((templateChartData.vmCount / numVMs) * 100),
    };
    templateToVMCountMap.set(key, { ...templateChartData, ...additionalData });
  }

  return templateToVMCountMap;
};

export const getChartData = (templateToVMCountMap) => {
  const chartData = [];
  templateToVMCountMap.forEach((data, templateName) => {
    chartData.push({
      fill: data.color,
      x: templateName,
      y: data.percentage,
    });
  });
  return chartData;
};

export const getLegendItems = (templateToVMCountMap): RunningVMsChartLegendLabelItem[] => {
  const legendItems = [];
  templateToVMCountMap.forEach((data, templateName) => {
    legendItems.push({
      color: data.color,
      name: templateName,
      namespace: data.namespace,
      vmCount: data.vmCount,
    });
  });
  return legendItems;
};
