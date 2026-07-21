import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

import { ADD_TEMPLATE_FEATURE_GATE_PATCH, TEMPLATE_FEATURE_GATE } from './constants';

export const isTemplatePatch = (patch: Patch): boolean =>
  patch?.op === ADD_TEMPLATE_FEATURE_GATE_PATCH.op &&
  patch?.path === ADD_TEMPLATE_FEATURE_GATE_PATCH.path &&
  patch?.value === ADD_TEMPLATE_FEATURE_GATE_PATCH.value;

export const parseJsonPatchAnnotation = (annotationValue: string): Patch[] => {
  try {
    if (!annotationValue) return [];
    const parsed: unknown = JSON.parse(annotationValue);
    return Array.isArray(parsed) ? (parsed as Patch[]) : [];
  } catch {
    return [];
  }
};

/**
 * Template is a KubeVirt Beta feature gate (enabled by default unless listed in
 * disabledFeatureGates). Older clusters may only expose it via featureGates.
 * @param featureGates
 * @param disabledFeatureGates
 */
export const isTemplateFeatureGateEnabled = (
  featureGates: string[] | undefined,
  disabledFeatureGates: string[] | undefined,
): boolean => {
  if (featureGates?.includes(TEMPLATE_FEATURE_GATE)) {
    return true;
  }

  if (Array.isArray(disabledFeatureGates)) {
    return !disabledFeatureGates.includes(TEMPLATE_FEATURE_GATE);
  }

  return false;
};
