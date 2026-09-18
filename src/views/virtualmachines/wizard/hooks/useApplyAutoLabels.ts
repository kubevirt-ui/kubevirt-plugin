import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';

export type UseApplyAutoLabelsResult = {
  adminLabels: AutoAppliedLabel[];
  isLoading?: boolean;
  userDefaults: Record<string, string>;
};

const useApplyAutoLabels = (cluster?: string): UseApplyAutoLabelsResult => {
  const { labels: adminLabels, loaded: adminLoaded } = useAutoAppliedLabels(cluster);
  const [userDefaults, , userLoaded] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.defaultVMLabels,
    cluster,
  );
  const isLoading = !adminLoaded || !userLoaded;

  return { adminLabels, isLoading, userDefaults: userDefaults ?? {} };
};

export default useApplyAutoLabels;
