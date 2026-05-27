import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { NAMESPACE_NAME_LABEL_KEY } from '@kubevirt-utils/constants/constants';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceResources from '@kubevirt-utils/hooks/useNamespaceResources';
import { Radio, Stack, Title } from '@patternfly/react-core';

import { NamespaceMappingOption, VMNetworkForm } from '../constants';

import NamespaceList from './NamespaceList';
import NamespaceSelector from './NamespaceSelector';

type NamespaceMappingProps = {
  isEditModal?: boolean;
};

const NamespaceMapping: FC<NamespaceMappingProps> = ({ isEditModal = false }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<VMNetworkForm>();

  const namespaceMappingOption = watch('namespaceMappingOption');

  const [namespaces, loadedNamespaces, errorLoadingNamespaces] = useNamespaceResources();

  return (
    <>
      {!isEditModal && (
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Namespace mapping')}</Title>
          <p>{t('Link your new network to specific namespaces.')}</p>
        </Stack>
      )}

      {/* Make this network available for all namespaces = configure with default namespace selector */}
      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', {
                matchLabels: { [NAMESPACE_NAME_LABEL_KEY]: DEFAULT_NAMESPACE },
              });
              onChange(NamespaceMappingOption.AllNamespaces);
            }}
            id="namespace-all"
            isChecked={namespaceMappingOption === NamespaceMappingOption.AllNamespaces}
            label={t('Make this network available for all namespaces')}
            name="namespace-mapping"
          />
        )}
        control={control}
        name="namespaceMappingOption"
      />

      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', { matchExpressions: [] });
              onChange(NamespaceMappingOption.SelectFromList);
            }}
            id="namespace-list"
            isChecked={namespaceMappingOption === NamespaceMappingOption.SelectFromList}
            label={t('Select namespaces from list')}
            name="namespace-mapping"
          />
        )}
        control={control}
        name="namespaceMappingOption"
      />

      {namespaceMappingOption === NamespaceMappingOption.SelectFromList && (
        <NamespaceList
          errorLoadingNamespaces={errorLoadingNamespaces}
          loadedNamespaces={loadedNamespaces}
          namespaces={namespaces}
        />
      )}

      <Controller
        render={({ field: { onChange } }) => (
          <Radio
            onChange={() => {
              setValue('network.spec.namespaceSelector', { matchLabels: {} });
              onChange(NamespaceMappingOption.SelectByLabels);
            }}
            description={t('Ensure the namespaces for this network have the labels you specified.')}
            id="namespace-labels"
            isChecked={namespaceMappingOption === NamespaceMappingOption.SelectByLabels}
            label={t('Select labels to specify qualifying namespaces')}
            name="namespace-mapping"
          />
        )}
        control={control}
        name="namespaceMappingOption"
      />

      {namespaceMappingOption === NamespaceMappingOption.SelectByLabels && <NamespaceSelector />}
    </>
  );
};

export default NamespaceMapping;
