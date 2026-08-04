import { getName } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { OBSERVABILITY_CMA_NAMES } from './constants';

type GrafanaDashboardData = {
  uid?: string;
};

export const isObservabilityCMA = (addon: K8sResourceCommon): boolean => {
  const name = getName(addon);
  return Boolean(name && (OBSERVABILITY_CMA_NAMES as readonly string[]).includes(name));
};

export const parseDashboardData = (raw: string | undefined): GrafanaDashboardData => {
  try {
    const parsed: unknown = JSON.parse(raw ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    const uid = (parsed as { uid?: unknown }).uid;
    return typeof uid === 'string' ? { uid } : {};
  } catch {
    return {};
  }
};
