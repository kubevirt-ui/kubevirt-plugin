import React, { FC, ReactNode } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../../utils/helpers';
import { useIDEntitiesValue } from '../AffinityForm';

import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type FieldsEditListProps = {
  errorHelperText: ReactNode;
  fields: useIDEntitiesValue;
  helperText: ReactNode;
  label: string;
};

const FieldsEditList: FC<FieldsEditListProps> = ({
  errorHelperText,
  fields,
  helperText,
  label,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: affinityFields,
    initialEntitiesChanged: affinityFieldsChanged,
    onEntityAdd: onFieldAdd,
    onEntityChange: onFieldChange,
    onEntityDelete: onFieldDelete,
  } = fields || {};

  return (
    <>
      <FormGroup fieldId="field-selector" label={label}>
        <FormGroupHelperText>{helperText}</FormGroupHelperText>
      </FormGroup>
      <AffinityEditList
        addRowText={t('Add field')}
        expressions={affinityFields}
        onAdd={() => onFieldAdd({ id: null, key: '', operator: Operator.In, values: [] })}
        onChange={onFieldChange}
        onDelete={onFieldDelete}
        rowID="field"
      />
      {isTermsInvalid(affinityFields) && affinityFieldsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default FieldsEditList;
