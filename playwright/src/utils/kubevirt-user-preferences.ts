/**
 * KubeVirt plugin user settings live in the SDK user preferences (CNV-100983): the per-user console
 * ConfigMap `openshift-console-user-settings/user-settings-<user>`, one data key per setting,
 * named `kubevirt.<setting>` (`kubevirt.ssh.<cluster>` for SSH keys of ACM spoke clusters only; the
 * local cluster and the ACM hub cluster share `kubevirt.ssh`, so never pass the hub name as `cluster`).
 * The legacy shared `openshift-cnv/kubevirt-user-settings` ConfigMap is no longer used by the plugin.
 */

export const CONSOLE_USER_SETTINGS_NAMESPACE = 'openshift-console-user-settings';

/** Substring of the console proxy URL hit by the console whenever a user preference is persisted. */
export const USER_PREFERENCES_URL_FRAGMENT = `configmaps/user-settings-`;

export const KUBEVIRT_PREFERENCE_PREFIX = 'kubevirt';

export type KubevirtPreferenceName =
  | 'columns'
  | 'columnWidths'
  | 'defaultVMLabels'
  | 'navigation'
  | 'onboardingPopoversHidden'
  | 'quickStart'
  | 'recentSearches'
  | 'savedSearches'
  | 'ssh';

/** Data key of a plugin setting in the console user-settings ConfigMap. */
export function kubevirtPreferenceKey(name: KubevirtPreferenceName, cluster?: string): string {
  return cluster && name === 'ssh'
    ? `${KUBEVIRT_PREFERENCE_PREFIX}.${name}.${cluster}`
    : `${KUBEVIRT_PREFERENCE_PREFIX}.${name}`;
}

/** Name of the console user-settings ConfigMap of a user (see {@link consoleUserSettingsKey}). */
export function consoleUserSettingsConfigMapName(userKey: string): string {
  return `user-settings-${userKey}`;
}

/**
 * Console identifier of a user: `kubeadmin` for the kube:admin user, otherwise the user uid
 * (falling back to the sanitized user name).
 */
export function consoleUserSettingsKey(user?: {
  metadata?: { name?: string; uid?: string };
}): string | undefined {
  const name = user?.metadata?.name;
  if (name === 'kube:admin') return 'kubeadmin';
  return user?.metadata?.uid || name?.replace(/[^-._a-zA-Z0-9]+/g, '-') || undefined;
}

/** Serializes plugin settings into console user-settings ConfigMap data entries. */
export function kubevirtPreferenceData(
  settings: Partial<Record<KubevirtPreferenceName, unknown>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(settings).map(([name, value]) => [
      kubevirtPreferenceKey(name as KubevirtPreferenceName),
      JSON.stringify(value),
    ]),
  );
}

/** Plugin settings keeping the welcome modal, guided tour and onboarding popovers out of the way. */
export function kubevirtWelcomeHiddenPreferenceData(): Record<string, string> {
  return kubevirtPreferenceData({
    navigation: { autoHideNav: false },
    onboardingPopoversHidden: {
      catalog: true,
      createProject: true,
      navCollapse: true,
      vmsTab: true,
    },
    quickStart: { activeQuickStartID: '', dontShowWelcomeModal: true },
  });
}

/** Playwright route glob matching the console user-settings ConfigMap of any user. */
export const CONSOLE_USER_SETTINGS_ROUTE = `**/api/kubernetes/api/v1/namespaces/${CONSOLE_USER_SETTINGS_NAMESPACE}/configmaps/user-settings-*`;

/**
 * Returns a copy of a console user-settings ConfigMap body whose `kubevirt.*` preferences are
 * replaced by `settings` (other console preferences are left untouched). Used to mock the plugin
 * user settings in UI tests.
 */
export function withMockedKubevirtPreferences(
  body: Record<string, unknown>,
  settings: Partial<Record<KubevirtPreferenceName, unknown>>,
): Record<string, unknown> {
  const existingData = (body['data'] as Record<string, string> | undefined) ?? {};
  const data = Object.fromEntries(
    Object.entries(existingData).filter(
      ([key]) => !key.startsWith(`${KUBEVIRT_PREFERENCE_PREFIX}.`),
    ),
  );
  return { ...body, data: { ...data, ...kubevirtPreferenceData(settings) } };
}
