import React, { type FC, type MouseEvent } from 'react';

import { LabelsEditor } from '@kubevirt-utils/components/LabelsEditor/LabelsEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { SimpleSelect } from '@patternfly/react-templates';

import { type AffinityLabel } from '../../../../utils/types';

type AffinityExpressionRowProps = {
  expression: AffinityLabel;
  onChange: (label: AffinityLabel) => void;
  onDelete: (id: number) => void;
  rowID?: string;
};

const AffinityExpressionRow: FC<AffinityExpressionRowProps> = ({
  expression,
  onChange,
  onDelete,
  rowID = 'affinity',
}) => {
  const { t } = useKubevirtTranslation();
  const { id, key, operator, values = [] } = expression;
  const enableValueField = operator !== Operator.Exists && operator !== Operator.DoesNotExist;

  const onSelectOperator = (_event: MouseEvent<Element>, selection: number | string): void => {
    onChange({ ...expression, operator: selection as Operator });
  };

  const onSelectValues = (_event: MouseEvent<Element>, selection: number | string): void => {
    const selectionStr = String(selection);
    const isValueExist = values.includes(selectionStr);
    if (isValueExist) {
      onChange({ ...expression, values: values.filter((item) => item !== selectionStr) });
    } else {
      onChange({ ...expression, values: [...values, selectionStr] });
    }
  };

  return (
    <>
      <GridItem span={4}>
        <TextInput
          id={`${rowID}-${id}-key-input`}
          isRequired
          onChange={(_event, newKey) => onChange({ ...expression, key: newKey })}
          placeholder={t('key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={2}>
        <SimpleSelect
          id={`${rowID}-${id}-effect-select`}
          initialOptions={[Operator.Exists, Operator.DoesNotExist, Operator.In, Operator.NotIn].map(
            (operatorOption) => ({
              content: operatorOption,
              selected: operatorOption === operator,
              value: operatorOption,
            }),
          )}
          onSelect={onSelectOperator}
        />
      </GridItem>
      <GridItem span={5}>
        <LabelsEditor
          isHidden={!enableValueField}
          onClear={() => onChange({ ...expression, values: [] })}
          onSelect={onSelectValues}
          values={values}
        />
      </GridItem>
      <GridItem span={1}>
        <Button
          icon={<MinusCircleIcon />}
          id={`${rowID}-${id}-delete-btn`}
          onClick={() => onDelete(id)}
          variant={ButtonVariant.plain}
        />
      </GridItem>
    </>
  );
};

export default AffinityExpressionRow;
