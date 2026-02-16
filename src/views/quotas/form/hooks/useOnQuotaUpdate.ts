import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';

type UseOnQuotaUpdate = (
  formData: ApplicationAwareResourceQuota,
  onChange?: (data: ApplicationAwareResourceQuota) => void,
) => {
  updateHardValue: (key: string, value: number, unit?: string) => void;
  updateMetadata: (key: string, value: string) => void;
};

const useOnQuotaUpdate: UseOnQuotaUpdate = (formData, onChange) => {
  const namespace = useNamespaceParam();

  const updateFormData = (updated: ApplicationAwareResourceQuota) => {
    onChange?.({
      ...updated,
      metadata: {
        ...updated?.metadata,
        namespace: getNamespace(updated) || namespace,
      },
    });
  };

  const updateMetadata = (key: string, value: string) => {
    updateFormData({
      ...formData,
      metadata: {
        ...formData?.metadata,
        [key]: value,
      },
    });
  };

  const updateHardValue = (key: string, value: number, unit = '') => {
    updateFormData({
      ...formData,
      spec: {
        ...formData?.spec,
        hard: {
          ...formData?.spec?.hard,
          [key]: isNaN(value) ? undefined : `${value}${unit}`,
        },
      },
    });
  };

  return { updateHardValue, updateMetadata };
};

export default useOnQuotaUpdate;
