import { UseXAxisTicks } from './types';
import { getDayMidpoints, isSingleDayData, xTickFormat } from './utils';

// Ticks should be placed at the center point of each day's data
const useXAxisTicks: UseXAxisTicks = (chartData) => {
  if (!chartData) {
    return [null, null];
  }

  const tickValues: Date[] = isSingleDayData(chartData)
    ? [chartData?.[Math.floor((chartData.length - 1) / 2)]?.x]
    : getDayMidpoints(chartData).sort((a, b) => Number(a) - Number(b));

  return [tickValues, xTickFormat];
};

export default useXAxisTicks;
