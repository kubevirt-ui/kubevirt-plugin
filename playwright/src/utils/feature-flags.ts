import type RequestContextClient from '@/clients/request-context-client';

const TEMPLATE_FEATURE_GATE = 'Template';

/**
 * Checks whether the KubeVirt "Template" feature gate is enabled by inspecting
 * the KubeVirt CR's developerConfiguration. Template is a Beta gate — enabled
 * by default unless explicitly listed in disabledFeatureGates.
 */
export async function isNativeVmTemplatesEnabled(
  apiClient: RequestContextClient,
): Promise<boolean> {
  try {
    const kubevirt = await apiClient.getKubeVirt();
    const devConfig = (kubevirt?.spec as Record<string, unknown>)?.configuration as
      | Record<string, unknown>
      | undefined;
    const developerConfiguration = devConfig?.developerConfiguration as
      | { featureGates?: string[]; disabledFeatureGates?: string[] }
      | undefined;

    const featureGates = developerConfiguration?.featureGates;
    const disabledFeatureGates = developerConfiguration?.disabledFeatureGates;

    if (featureGates?.includes(TEMPLATE_FEATURE_GATE)) {
      return true;
    }

    if (Array.isArray(disabledFeatureGates)) {
      return !disabledFeatureGates.includes(TEMPLATE_FEATURE_GATE);
    }

    return false;
  } catch {
    return false;
  }
}
