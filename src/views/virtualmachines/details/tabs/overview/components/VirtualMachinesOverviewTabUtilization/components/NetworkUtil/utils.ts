import xbytes from 'xbytes';

import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const getInterfaceNetworkRate = (
  networkTotal: PrometheusResponse,
  interfaceName: string,
): string => {
  const bytesPerSecond =
    Number(
      networkTotal?.data?.result?.find((result) => result?.metric?.interface === interfaceName)
        ?.value?.[1],
    ) || 0;

  return `${xbytes(bytesPerSecond, { fixed: 2 })}ps`;
};
