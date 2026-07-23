import type RequestContextClient from '@/clients/request-context-client';

/**
 * Checks whether the "native VM templates" preview feature is enabled
 * by reading the kubevirt-ui-features ConfigMap via the API.
 */
export async function isNativeVmTemplatesEnabled(
  apiClient: RequestContextClient,
): Promise<boolean> {
  try {
    const cm = await apiClient.core.getUiFeatures();
    return cm?.data?.vmTemplates === 'true';
  } catch {
    return false;
  }
}
