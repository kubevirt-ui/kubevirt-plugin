import { HIDE_YAML_TAB } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

import { useIsAdmin } from '../useIsAdmin';

export type UseHideYamlTab = () => {
  hideYamlTab: boolean;
  loading: boolean;
};

const useHideYamlTab: UseHideYamlTab = () => {
  const isAdmin = useIsAdmin();
  const { featureEnabled, loading } = useFeatures(HIDE_YAML_TAB);

  // Return false while loading to prevent flash of hidden tabs
  const hideYamlTab = !loading && featureEnabled && !isAdmin;

  return { hideYamlTab, loading };
};

export default useHideYamlTab;
