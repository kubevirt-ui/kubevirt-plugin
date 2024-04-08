import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { DEFAULT_STORAGE_CLASS_ANNOTATION } from '@kubevirt-utils/hooks/useDefaultStorage/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';

const isDefaultStorageClass = (storageClass: IoK8sApiStorageV1StorageClass): boolean =>
  storageClass?.metadata?.annotations?.[DEFAULT_STORAGE_CLASS_ANNOTATION] === 'true';

export const getDefaultStorageClass = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): IoK8sApiStorageV1StorageClass => storageClasses?.find(isDefaultStorageClass);

export const getSCSelectOptions = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): EnhancedSelectOptionProps[] =>
  storageClasses?.map((sc) => {
    const scName = getName(sc);
    const defaultSC = isDefaultStorageClass(sc) ? t('(default) | ') : '';
    const descriptionAnnotation = getAnnotation(sc, DESCRIPTION_ANNOTATION)?.concat(' | ') || '';
    const scType = sc?.parameters?.type ? ' | '.concat(sc?.parameters?.type) : '';
    const description = `${defaultSC}${descriptionAnnotation}${sc?.provisioner}${scType}`;

    return {
      children: scName,
      description,
      groupVersionKind: modelToGroupVersionKind(StorageClassModel),
      value: scName,
    };
  });
