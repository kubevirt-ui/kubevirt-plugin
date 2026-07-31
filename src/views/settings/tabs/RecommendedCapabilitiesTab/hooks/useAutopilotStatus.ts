import { useMemo } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { HCO_AUTOPILOT_ANNOTATION } from '../utils/autopilotConstants';
import { AUTOPILOT_REGISTRY } from '../utils/autopilotRegistry';
import { deriveConfigStatus, watchAutopilotResources } from '../utils/autopilotUtils';
import { type AutopilotStatusMap } from '../utils/types';

type UseAutopilotStatusResult = {
  autopilotEnabled: boolean;
  autopilotLoaded: boolean;
  autopilotStatusMap: AutopilotStatusMap;
};

const useAutopilotStatus = (): UseAutopilotStatusResult => {
  const [hco, hcoLoaded] = useHyperConvergeConfiguration();

  const autopilotEnabled = hcoLoaded && getAnnotation(hco, HCO_AUTOPILOT_ANNOTATION) === 'true';

  const results =
    useKubevirtWatchResources<Record<string, K8sResourceCommon>>(watchAutopilotResources);

  const autopilotLoaded =
    hcoLoaded && Object.values(results).every((result) => result.loaded || !!result.loadError);

  const autopilotStatusMap = useMemo<AutopilotStatusMap>(
    () =>
      AUTOPILOT_REGISTRY.reduce<AutopilotStatusMap>((statusMap, entry) => {
        const result = results[entry.operatorPackageName];
        const resource = result?.data;

        statusMap[entry.operatorPackageName] = {
          configStatus:
            result?.loaded && !result?.loadError ? deriveConfigStatus(resource) : undefined,
          managedCR: resource || undefined,
          recommendedYAML: entry.recommendedYAML,
        };

        return statusMap;
      }, {}),
    [results],
  );

  return { autopilotEnabled, autopilotLoaded, autopilotStatusMap };
};

export default useAutopilotStatus;
