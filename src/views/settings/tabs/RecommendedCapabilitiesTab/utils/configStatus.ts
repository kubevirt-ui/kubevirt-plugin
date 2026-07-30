import {
  type AutopilotStatusMap,
  type CapabilityFeature,
  ConfigurationStatus,
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from './types';

import { isInstalled } from './installState';

export const getEffectiveConfigStatus = (
  autopilotConfigStatus: ConfigurationStatus | undefined,
  opDetails: RecommendedCapabilityOperatorDetails | undefined,
): ConfigurationStatus | undefined => {
  if (autopilotConfigStatus) return autopilotConfigStatus;
  if (opDetails && isInstalled(opDetails.installState)) return ConfigurationStatus.Manual;
  return undefined;
};

export const computeCapabilityConfigStatus = (
  feature: CapabilityFeature,
  autopilotStatusMap: AutopilotStatusMap,
  detailsMap: RecommendedCapabilityDetailsMap,
): ConfigurationStatus | undefined => {
  const statuses = feature.operators.map((operator) =>
    getEffectiveConfigStatus(
      autopilotStatusMap[operator.packageName]?.configStatus,
      detailsMap[operator.packageName],
    ),
  );

  if (statuses.every((status) => status === undefined)) return undefined;
  if (statuses.some((status) => status === ConfigurationStatus.Manual || status === undefined))
    return ConfigurationStatus.Manual;
  if (statuses.every((status) => status === ConfigurationStatus.Recommended))
    return ConfigurationStatus.Recommended;
  return undefined;
};
