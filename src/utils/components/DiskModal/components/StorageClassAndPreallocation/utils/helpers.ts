import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import {
  isDefaultStorageClass,
  isVirtDefaultStorageClass,
} from '@kubevirt-utils/hooks/useDefaultStorage/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';

export const getDefaultStorageClass = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): IoK8sApiStorageV1StorageClass =>
  storageClasses?.find(isVirtDefaultStorageClass) ?? storageClasses?.find(isDefaultStorageClass);

export const getSCSelectOptions = (
  storageClasses: IoK8sApiStorageV1StorageClass[],
): EnhancedSelectOptionProps[] =>
  storageClasses?.map((storageClass) => {
    const scName = getName(storageClass);
    const defaultSC = isDefaultStorageClass(storageClass) ? t('(default) | ') : '';
    const descriptionAnnotation =
      getAnnotation(storageClass, DESCRIPTION_ANNOTATION)?.concat(' | ') || '';
    const scType = storageClass?.parameters?.type
      ? ' | '.concat(storageClass?.parameters?.type)
      : '';
    const description = `${defaultSC}${descriptionAnnotation}${storageClass?.provisioner}${scType}`;

    return {
      children: scName,
      description,
      groupVersionKind: modelToGroupVersionKind(StorageClassModel),
      value: scName,
    };
  });
