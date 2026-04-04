import { Patch } from '@openshift-console/dynamic-plugin-sdk';

import { ADD_TEMPLATE_FEATURE_GATE_PATCH } from './constants';

export const isTemplatePatch = (p: Patch) =>
  p?.op === ADD_TEMPLATE_FEATURE_GATE_PATCH.op &&
  p?.path === ADD_TEMPLATE_FEATURE_GATE_PATCH.path &&
  p?.value === ADD_TEMPLATE_FEATURE_GATE_PATCH.value;

export const parseJsonPatchAnnotation = (annotationValue: string): Patch[] => {
  try {
    if (!annotationValue) return [];
    const parsed = JSON.parse(annotationValue);
    return Array.isArray(parsed) ? (parsed as Patch[]) : [];
  } catch {
    return [];
  }
};
