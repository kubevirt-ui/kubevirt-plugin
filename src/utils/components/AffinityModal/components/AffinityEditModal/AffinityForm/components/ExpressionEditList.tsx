import React, { FC, ReactNode } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { isTermsInvalid } from '../../../../utils/helpers';
import { useIDEntitiesValue } from '../AffinityForm';

import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type ExpressionEditListProps = {
  errorHelperText: ReactNode;
  expressions: useIDEntitiesValue;
  helperText: ReactNode;
  label: string;
};

const ExpressionEditList: FC<ExpressionEditListProps> = ({
  errorHelperText,
  expressions,
  helperText,
  label,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: affinityExpressions,
    initialEntitiesChanged: affinityExpressionsChanged,
    onEntityAdd: onExpressionAdd,
    onEntityChange: onExpressionChange,
    onEntityDelete: onExpressionDelete,
  } = expressions || {};

  return (
    <>
      <FormGroup fieldId="expression-selector" label={label}>
        <FormGroupHelperText>{helperText}</FormGroupHelperText>
      </FormGroup>
      <AffinityEditList
        addRowText={t('Add expression')}
        expressions={affinityExpressions}
        onAdd={() => onExpressionAdd({ id: null, key: '', operator: Operator.In, values: [] })}
        onChange={onExpressionChange}
        onDelete={onExpressionDelete}
        rowID="expression"
      />
      {isTermsInvalid(affinityExpressions) && affinityExpressionsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default ExpressionEditList;
