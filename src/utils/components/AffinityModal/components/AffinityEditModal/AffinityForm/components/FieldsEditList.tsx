import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../../utils/helpers';
import { useIDEntitiesValue } from '../AffinityForm';

import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type FieldsEditListProps = {
  errorHelperText: React.ReactNode;
  fields: useIDEntitiesValue;
  helperText: React.ReactNode;
  label: string;
};

const FieldsEditList: React.FC<FieldsEditListProps> = ({
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
      <FormGroup
        fieldId="field-selector"
        helperText={helperText}
        isHelperTextBeforeField
        label={label}
      />
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
