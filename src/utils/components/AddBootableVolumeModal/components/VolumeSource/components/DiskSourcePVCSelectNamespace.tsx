import React, { Dispatch, FC, SetStateAction } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

type DiskSourcePVCSelectNamespaceProps = {
  isDisabled?: boolean;
  onChange: Dispatch<SetStateAction<string>>;
  namespaceNames: string[];
  namespacesLoaded: boolean;
  selectedNamespace: string;
};

const DiskSourcePVCSelectNamespace: FC<DiskSourcePVCSelectNamespaceProps> = ({
  isDisabled,
  onChange,
  namespaceNames,
  namespacesLoaded,
  selectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  const fieldId = 'pvc-namespace-select';

  return (
    <FormGroup
      className="pvc-selection-formgroup"
      fieldId={fieldId}
      id={fieldId}
      isRequired
      label={t('Volume namespace')}
    >
      {namespacesLoaded ? (
        <>
          <InlineFilterSelect
            options={namespaceNames?.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(NamespaceModel),
              value: name,
            }))}
            toggleProps={{
              isDisabled,
              isFullWidth: true,
            }}
            placeholder={t('Select volume namespace')}
            selected={selectedNamespace}
            setSelected={onChange}
          />
          <FormGroupHelperText>{t('Location of the existing volume')}</FormGroupHelperText>
        </>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default DiskSourcePVCSelectNamespace;
