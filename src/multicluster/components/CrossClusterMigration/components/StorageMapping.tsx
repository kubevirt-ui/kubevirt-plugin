import React, { FC, useMemo } from 'react';

import { V1beta1StorageMap } from '@kubev2v/types';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { FormGroup, Split, SplitItem, TextInput, Title } from '@patternfly/react-core';

import { UseStorageReadinessReturnType } from '../hooks/useStorageReadiness';

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
  const storageClassOptions = useMemo(
    () =>
      storageClasses.map(
        (storageClass): EnhancedSelectOptionProps => ({
          children: getName(storageClass),
          groupVersionKind: modelToGroupVersionKind(StorageClassModel),
          value: getName(storageClass),
        }),
      ),
    [storageClasses],
  );

  return (
    <div>
      <Title className="cross-cluster-migration-title" headingLevel="h5">
        {t('Storage mapping')}
      </Title>
      {storageMap?.spec?.map?.map((map) => (
        <Split className="cross-cluster-migration-split" key={map.source.name}>
          <SplitItem isFilled>
            <FormGroup>
              <TextInput isDisabled value={map.source.name} />
            </FormGroup>
          </SplitItem>
          <SplitItem isFilled>
            <FormGroup>
              <InlineFilterSelect
                options={storageClassOptions}
                selected={map.destination.storageClass}
                selectProps={{ id: `storage-class-select-${map.source.name}` }}
                setSelected={(newSelection) => changeStorageMap(map.source.name, newSelection)}
                toggleProps={{ isFullWidth: true }}
              />
            </FormGroup>
          </SplitItem>
        </Split>
      ))}
    </div>
  );
};

export default StorageMapping;
