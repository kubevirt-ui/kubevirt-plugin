import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

type PersistentVolumeSelectNamespaceProps = {
  onChange: (newNamespace: string) => void;
  namespaces: string[];
  selectedNamespace: string;
};

export const PersistentVolumeSelectNamespace: FC<PersistentVolumeSelectNamespaceProps> = ({
  onChange,
  namespaces,
  selectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-namespace-select';

  const validated = !selectedNamespace ? ValidatedOptions.error : ValidatedOptions.default;

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('PVC namespace')}
    >
      <InlineFilterSelect
        options={namespaces?.map((name) => ({
          children: name,
          groupVersionKind: modelToGroupVersionKind(NamespaceModel),
          value: name,
        }))}
        toggleProps={{
          isFullHeight: true,
        }}
        placeholder={t('Select PVC namespace')}
        selected={selectedNamespace}
        setSelected={onChange}
      />
      <FormGroupHelperText validated={validated}>
        {validated === ValidatedOptions.default && t('Location of the existing PVC')}
      </FormGroupHelperText>
    </FormGroup>
  );
};
