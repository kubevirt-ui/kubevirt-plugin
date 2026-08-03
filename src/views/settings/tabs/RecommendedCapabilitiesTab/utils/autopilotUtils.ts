import { type TFunction } from 'i18next';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  AUTOPILOT_MANAGED_BY_LABEL,
  AUTOPILOT_MANAGED_BY_VALUE,
  AUTOPILOT_MODE_ANNOTATION,
  AUTOPILOT_MODE_UNMANAGED,
} from './autopilotConstants';
import { AUTOPILOT_REGISTRY, type AutopilotRegistryEntry } from './autopilotRegistry';
import { getRecommendedCapabilityFeatures } from './capabilityFeatures';
import { type CapabilityFeature, ConfigurationStatus } from './types';

export const watchAutopilotResources = Object.fromEntries(
  AUTOPILOT_REGISTRY.map((entry) => [
    entry.operatorPackageName,
    {
      groupVersionKind: modelToGroupVersionKind(entry.crModel),
      name: entry.crName,
      ...(entry.crNamespace && { namespace: entry.crNamespace }),
    },
  ]),
);

export const deriveConfigStatus = (
  resource: K8sResourceCommon | undefined,
): ConfigurationStatus | undefined => {
  if (!getName(resource)) return undefined;

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

const AUTOPILOT_PACKAGE_NAMES = new Set(
  AUTOPILOT_REGISTRY.map((entry) => entry.operatorPackageName),
);

const isAutopilotCapability = (feature: CapabilityFeature): boolean =>
  feature.operators.every(({ packageName }) => AUTOPILOT_PACKAGE_NAMES.has(packageName));

export const getAutopilotCapabilities = (t: TFunction): CapabilityFeature[] =>
  getRecommendedCapabilityFeatures(t).filter(isAutopilotCapability);

export const getManualCapabilities = (t: TFunction): CapabilityFeature[] =>
  getRecommendedCapabilityFeatures(t).filter((feature) => !isAutopilotCapability(feature));
