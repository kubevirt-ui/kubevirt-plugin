/**
 * Minimal client surface for native VM template feature detection
 * (works with both scenario and main RequestContextClient shapes).
 */
type NativeVmTemplatesClient = {
  getKubeVirtUiFeatures: (namespace?: string) => Promise<unknown>;
  listResources: (
    group: string,
    version: string,
    plural: string,
    namespace?: string,
  ) => Promise<unknown>;
};

/**
 * True when Save as template / native VM templates are available for gating.
 *
 * Prefers the kubevirt-ui-features `vmTemplates` preview flag (set by setup).
 * Falls back to VirtualMachineTemplate CRD presence — the Actions menu item is
 * shown when the product supports template.kubevirt.io (CNV 4.22+).
 */
export async function isNativeVmTemplatesEnabled(
  apiClient: NativeVmTemplatesClient,
): Promise<boolean> {
  try {
    const cm = (await apiClient.getKubeVirtUiFeatures()) as {
      data?: Record<string, string>;
    } | null;
    if (cm?.data?.vmTemplates === 'true') {
      return true;
    }
  } catch {
    // ConfigMap may be missing — fall through to CRD probe
  }

  try {
    await apiClient.listResources(
      'template.kubevirt.io',
      'v1beta1',
      'virtualmachinetemplates',
      'default',
    );
    return true;
  } catch {
    try {
      await apiClient.listResources(
        'template.kubevirt.io',
        'v1alpha1',
        'virtualmachinetemplates',
        'default',
      );
      return true;
    } catch {
      return false;
    }
  }
}
