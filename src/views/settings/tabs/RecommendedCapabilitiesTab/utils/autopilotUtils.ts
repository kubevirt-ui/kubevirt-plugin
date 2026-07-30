import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';

import {
  AUTOPILOT_MANAGED_BY_LABEL,
  AUTOPILOT_MANAGED_BY_VALUE,
  AUTOPILOT_MODE_ANNOTATION,
  AUTOPILOT_MODE_UNMANAGED,
} from './autopilotConstants';
import { AUTOPILOT_REGISTRY, type AutopilotRegistryEntry } from './autopilotRegistry';
import { ConfigurationStatus } from './types';

export const watchAutopilotResources = Object.fromEntries(
  AUTOPILOT_REGISTRY.map((entry) => [
    entry.operatorPackageName,
    {
      groupVersionKind: entry.crGVK,
      name: entry.crName,
      ...(entry.crNamespace && { namespace: entry.crNamespace }),
    },
  ]),
);

export const deriveConfigStatus = (
  resource: K8sResourceCommon | undefined,
): ConfigurationStatus | undefined => {
  if (!resource) return undefined;

  const managedBy = getLabel(resource, AUTOPILOT_MANAGED_BY_LABEL);
  const mode = getAnnotation(resource, AUTOPILOT_MODE_ANNOTATION);

  if (managedBy === AUTOPILOT_MANAGED_BY_VALUE && mode !== AUTOPILOT_MODE_UNMANAGED) {
    return ConfigurationStatus.Recommended;
  }

  return ConfigurationStatus.Manual;
};

export const getRegistryEntryByPackageName = (
  packageName: string,
): AutopilotRegistryEntry | undefined =>
  AUTOPILOT_REGISTRY.find((entry) => entry.operatorPackageName === packageName);
