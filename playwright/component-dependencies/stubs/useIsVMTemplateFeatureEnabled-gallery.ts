/**
 * Gallery alias for `useIsVMTemplateFeatureEnabled`.
 * Template user-feature flag off so catalog uses default OpenShift template behavior.
 */

/** Feature flag stub: disabled and not loading. */
const useIsVMTemplateFeatureEnabled = (): { featureEnabled: boolean; loading: boolean } => ({
  featureEnabled: false,
  loading: false,
});

export default useIsVMTemplateFeatureEnabled;
