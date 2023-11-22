import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import {
  Button,
  ButtonVariant,
  GridItem,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { AffinityLabel } from '../../../../utils/types';

import './affinity-edit-row.scss';

type AffinityExpressionRowProps = {
  expression: AffinityLabel;
  onChange: (label: AffinityLabel) => void;
  onDelete: (id: any) => void;
  rowID?: string;
};

const AffinityExpressionRow: React.FC<AffinityExpressionRowProps> = ({
  expression,
  onChange,
  onDelete,
  rowID = 'affinity',
}) => {
  const { t } = useKubevirtTranslation();
  const { id, key, operator, values = [] } = expression;
  const enableValueField = operator !== Operator.Exists && operator !== Operator.DoesNotExist;
  const [isOperatorExpended, setIsOperatorExpended] = React.useState(false);
  const [isValuesExpanded, setIsValuesExpanded] = React.useState(false);

  const onSelectOperator = (event, selection) => {
    onChange({ ...expression, operator: selection });
    setIsOperatorExpended(false);
  };

  const onSelectValues = (event, selection) => {
    const isValueExist = values.some((item) => item === selection);
    if (isValueExist) {
      onChange({ ...expression, values: values.filter((item) => item !== selection) });
    } else {
      onChange({ ...expression, values: [...values, selection] });
    }
  };
  return (
    <>
      <GridItem span={4}>
        <TextInput
          id={`${rowID}-${id}-key-input`}
          isRequired
          onChange={(newKey) => onChange({ ...expression, key: newKey })}
          placeholder={t('key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={2}>
        <Select
          id={`${rowID}-${id}-effect-select`}
          isOpen={isOperatorExpended}
          menuAppendTo="parent"
          onSelect={onSelectOperator}
          onToggle={setIsOperatorExpended}
          selections={operator}
          value={operator}
        >
          {[Operator.Exists, Operator.DoesNotExist, Operator.In, Operator.NotIn].map(
            (operatorOption) => (
              <SelectOption key={operatorOption} value={operatorOption} />
            ),
          )}
        </Select>
      </GridItem>
      <GridItem span={5}>
        <Select
          className="affinity-edit-row__values-chips"
          isCreatable
          isDisabled={!enableValueField}
          isOpen={isValuesExpanded}
          menuAppendTo="parent"
          onClear={() => onChange({ ...expression, values: [] })}
          onSelect={onSelectValues}
          onToggle={setIsValuesExpanded}
          placeholderText={enableValueField ? t('Enter value') : ''}
          selections={enableValueField ? values : []}
          typeAheadAriaLabel={t('Enter value')}
          variant={SelectVariant.typeaheadMulti}
        >
          {values?.map((option) => (
            <SelectOption isDisabled={false} key={option} value={option} />
          ))}
        </Select>
      </GridItem>
      <GridItem span={1}>
        <Button
          id={`${rowID}-${id}-delete-btn`}
          onClick={() => onDelete(id)}
          variant={ButtonVariant.plain}
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </>
  );
};

export default AffinityExpressionRow;
