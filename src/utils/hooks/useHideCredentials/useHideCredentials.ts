import { HIDE_CREDENTIALS_NON_PRIVILEGED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

export type UseHideCredentials = () => {
  loading: boolean;
  shouldHideCredentials: boolean;
};

const useHideCredentials: UseHideCredentials = () => {
  const { canEdit, featureEnabled, loading } = useFeatures(HIDE_CREDENTIALS_NON_PRIVILEGED);

  const shouldHideCredentials = featureEnabled && !canEdit;

  return {
    loading,
    shouldHideCredentials,
  };
};

export default useHideCredentials;
