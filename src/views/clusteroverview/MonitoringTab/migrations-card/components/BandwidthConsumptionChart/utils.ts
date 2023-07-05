import { multipliers } from '@kubevirt-utils/utils/units';

const GRID_LINES = 2;

export const getTickValuesAxisY = (maxValue: number, normalize = multipliers.Gi) => {
  const tickValues = [];

  const normalizedMaxValue = Math.ceil(maxValue / normalize);
  const gridLineSpacer = Math.ceil(normalizedMaxValue / GRID_LINES) || 1;
  for (let i = 0; i <= gridLineSpacer * GRID_LINES; i += gridLineSpacer) {
    tickValues.push(i * normalize);
  }

  return tickValues;
};

export const getDomainY = (maxValue: number, normalize = multipliers.Gi): [number, number] => {
  const tickValues = getTickValuesAxisY(maxValue, normalize);
  return [tickValues?.[0], tickValues?.[GRID_LINES]];
};
