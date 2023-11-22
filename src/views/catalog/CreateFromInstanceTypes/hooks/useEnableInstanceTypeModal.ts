import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';

type UseEnableInstanceTypeModalValues = {
  canEdit: boolean;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onEnableInstanceTypeFeature: () => void;
};

type UseEnableInstanceTypeModal = (
  isInstanceTypeTab: boolean,
  navigateToCatalog: () => void,
) => UseEnableInstanceTypeModalValues;

const useEnableInstanceTypeModal: UseEnableInstanceTypeModal = (
  isInstanceTypeTab,
  navigateToCatalog,
) => {
  const { canEdit, featureEnabled, loading, toggleFeature } = useFeatures(INSTANCE_TYPE_ENABLED);

  const onClose = () => {
    navigateToCatalog();
  };

  const onEnableInstanceTypeFeature = () => {
    toggleFeature(true);
  };
  return {
    canEdit,
    isOpen: isInstanceTypeTab && !featureEnabled,
    loading,
    onClose,
    onEnableInstanceTypeFeature,
  };
};

export default useEnableInstanceTypeModal;
