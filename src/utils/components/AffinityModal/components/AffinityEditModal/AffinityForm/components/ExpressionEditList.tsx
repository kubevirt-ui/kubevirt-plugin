import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../../utils/helpers';
import { useIDEntitiesValue } from '../AffinityForm';

import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type ExpressionEditListProps = {
  expressions: useIDEntitiesValue;
  label: string;
  helperText: React.ReactNode;
  errorHelperText: React.ReactNode;
  setSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const ExpressionEditList: React.FC<ExpressionEditListProps> = ({
  expressions,
  label,
  helperText,
  errorHelperText,
  setSubmitDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: affinityExpressions,
    onEntityAdd: onExpressionAdd,
    onEntityChange: onExpressionChange,
    onEntityDelete: onExpressionDelete,
    initialEntitiesChanged: affinityExpressionsChanged,
  } = expressions || {};

  return (
    <>
      <FormGroup
        label={label}
        helperText={helperText}
        fieldId="expression-selector"
        isHelperTextBeforeField
      />
      <AffinityEditList
        expressions={affinityExpressions}
        addRowText={t('Add Expression')}
        onAdd={() => onExpressionAdd({ id: null, key: '', values: [], operator: Operator.In })}
        onChange={onExpressionChange}
        onDelete={onExpressionDelete}
        rowID="expression"
        setSubmitDisabled={setSubmitDisabled}
      />
      {isTermsInvalid(affinityExpressions) && affinityExpressionsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default ExpressionEditList;
