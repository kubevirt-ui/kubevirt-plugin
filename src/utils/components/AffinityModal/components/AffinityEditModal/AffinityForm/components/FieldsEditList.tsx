import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../../utils/helpers';
import { useIDEntitiesValue } from '../AffinityForm';

import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type FieldsEditListProps = {
  fields: useIDEntitiesValue;
  label: string;
  helperText: React.ReactNode;
  errorHelperText: React.ReactNode;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const FieldsEditList: React.FC<FieldsEditListProps> = ({
  fields,
  label,
  helperText,
  errorHelperText,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: affinityFields,
    onEntityAdd: onFieldAdd,
    onEntityChange: onFieldChange,
    onEntityDelete: onFieldDelete,
    initialEntitiesChanged: affinityFieldsChanged,
  } = fields || {};

  return (
    <>
      <FormGroup
        label={label}
        helperText={helperText}
        fieldId="field-selector"
        isHelperTextBeforeField
      />
      <AffinityEditList
        expressions={affinityFields}
        addRowText={t('Add Field')}
        onAdd={() => onFieldAdd({ id: null, key: '', values: [], operator: Operator.In })}
        onChange={onFieldChange}
        onDelete={onFieldDelete}
        rowID="field"
        setSubmitDisabled={setSubmitDisabled}
      />
      {isTermsInvalid(affinityFields) && affinityFieldsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default FieldsEditList;
