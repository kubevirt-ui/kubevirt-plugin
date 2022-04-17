import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { id, key, values = [], operator } = expression;
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
          placeholder={t('key')}
          isRequired
          type="text"
          value={key}
          onChange={(newKey) => onChange({ ...expression, key: newKey })}
        />
      </GridItem>
      <GridItem span={2}>
        <Select
          menuAppendTo="parent"
          id={`${rowID}-${id}-effect-select`}
          value={operator}
          isOpen={isOperatorExpended}
          onToggle={setIsOperatorExpended}
          onSelect={onSelectOperator}
          selections={operator}
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
          menuAppendTo="parent"
          isDisabled={!enableValueField}
          variant={SelectVariant.typeaheadMulti}
          isOpen={isValuesExpanded}
          isCreatable
          typeAheadAriaLabel={t('Enter Value')}
          onToggle={setIsValuesExpanded}
          onClear={() => onChange({ ...expression, values: [] })}
          onSelect={onSelectValues}
          selections={enableValueField ? values : []}
          placeholderText={enableValueField ? t('Enter Value') : ''}
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
