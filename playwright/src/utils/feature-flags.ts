import type RequestContextClient from '@/clients/request-context-client';

const TEMPLATE_FEATURE_GATE = 'Template';
const VSOCK_FEATURE_GATE = 'VSOCK';

type DeveloperConfiguration = {
  featureGates?: string[];
  disabledFeatureGates?: string[];
};

function getDeveloperConfigurationFromKubeVirtResource(
  resource: { spec?: Record<string, unknown> } | null | undefined,
): DeveloperConfiguration | undefined {
  const configuration = resource?.spec?.configuration as Record<string, unknown> | undefined;
  return configuration?.developerConfiguration as DeveloperConfiguration | undefined;
}

/**
 * Checks whether the KubeVirt "VSOCK" feature gate is enabled by inspecting
 * the KubeVirt CR's developerConfiguration (same source as cluster gate docs).
 */
export async function isVsockFeatureEnabled(
  apiClient: RequestContextClient,
): Promise<boolean> {
  try {
    const kubevirt = await apiClient.getKubeVirt();
    const featureGates = getDeveloperConfigurationFromKubeVirtResource(
      kubevirt as { spec?: Record<string, unknown> },
    )?.featureGates;
    return featureGates?.includes(VSOCK_FEATURE_GATE) ?? false;
  } catch {
    return false;
  }
}

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
    const developerConfiguration = getDeveloperConfigurationFromKubeVirtResource(
      kubevirt as { spec?: Record<string, unknown> },
    );

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
