import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Spinner } from '@patternfly/react-core';

type GeneralSettingsNamespaceSelectorProps = {
  loaded: boolean;
  onSelect: (value: string) => void;
  namespaces: K8sResourceCommon[];
  selectedNamespace: string;
};
const GeneralSettingsNamespaceSelector: FC<GeneralSettingsNamespaceSelectorProps> = ({
  loaded,
  onSelect,
  namespaces,
  selectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <InlineFilterSelect
      options={[
        ...namespaces
          ?.map((namespace) => ({
            groupVersionKind: modelToGroupVersionKind(NamespaceModel),
            value: getName(namespace),
          }))
          .sort((a, b) => a.value.localeCompare(b.value)),
      ]}
      toggleProps={{
        icon: !loaded && <Spinner size="sm" />,
        isDisabled: !loaded,
      }}
      placeholder={t('Select namespace')}
      selected={selectedNamespace}
      setSelected={onSelect}
    />
  );
};

export default GeneralSettingsNamespaceSelector;
