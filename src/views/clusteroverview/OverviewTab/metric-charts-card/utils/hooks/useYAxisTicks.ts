import { UseYAxisTicks } from './types';
import { yTickFormat } from './utils';

const useYAxisTicks: UseYAxisTicks = (metricChartData) => {
  const { largestValue } = metricChartData;

  // There should be five Y-axis ticks with only 0 and the highest value labeled
  const oneFourthLargestValue = largestValue / 4;
  const tickValues = [0];
  for (let i = 1; i <= 3; i++) {
    tickValues.push(tickValues[tickValues.length - 1] + oneFourthLargestValue);
  }
  tickValues.push(largestValue);

  return [tickValues, yTickFormat];
};

export default useYAxisTicks;
