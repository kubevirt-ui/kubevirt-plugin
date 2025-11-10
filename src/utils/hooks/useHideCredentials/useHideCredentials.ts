import { HIDE_CREDENTIALS_NON_PRIVILEGED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

import { useIsAdmin } from '../useIsAdmin';

export type UseHideCredentials = () => {
  loading: boolean;
  shouldHideCredentials: boolean;
};

const useHideCredentials: UseHideCredentials = () => {
  const isAdmin = useIsAdmin();
  const { featureEnabled, loading } = useFeatures(HIDE_CREDENTIALS_NON_PRIVILEGED);

  const shouldHideCredentials = featureEnabled && !isAdmin;

  return {
    loading,
    shouldHideCredentials,
  };
};

export default useHideCredentials;
