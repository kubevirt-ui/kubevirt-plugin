import { type FC, useMemo } from 'react';

import { type V1beta1StorageMap } from '@forklift-ui/types';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';

import { getStorageDestinationSelectValue } from '../mappingDisplayUtils';

import { type UseStorageReadinessReturnType } from '../hooks/useStorageReadiness';
import ResourceMappingPanel from './ResourceMappingPanel';

type StorageMappingProps = {
  changeStorageMap: UseStorageReadinessReturnType['changeStorageMap'];
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageMap: V1beta1StorageMap;
};

const StorageMapping: FC<StorageMappingProps> = ({
  changeStorageMap,
  storageClasses,
  storageMap,
}) => {
  const { t } = useKubevirtTranslation();

  const rows = useMemo(
    () =>
      (storageMap?.spec?.map ?? []).map((map) => ({
        rowId: map.source.name ?? '',
        selectedValue: getStorageDestinationSelectValue(map),
        sourceValue: map.source.name ?? '',
      })),
    [storageMap?.spec?.map],
  );

  const selectOptions = useMemo(
    (): EnhancedSelectOptionProps[] =>
      storageClasses.map((storageClass) => {
        const name = getName(storageClass) ?? '';
        return {
          children: name,
          groupVersionKind: modelToGroupVersionKind(StorageClassModel),
          value: name,
        };
      }),
    [storageClasses],
  );

  return (
    <ResourceMappingPanel
      heading={t('Storage mapping')}
      onSelect={changeStorageMap}
      rows={rows}
      selectIdPrefix="storage-class-select"
      selectOptions={selectOptions}
      sourceTermLabel={t('Source storage class')}
      targetTermLabel={t('Target storage class')}
      testIdPrefix="storage-mapping"
    />
  );
};

export default StorageMapping;
