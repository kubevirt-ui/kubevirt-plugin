import React, { FC } from 'react';

import { LabelsEditor } from '@kubevirt-utils/components/LabelsEditor/LabelsEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Operator } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { SimpleSelect } from '@patternfly/react-templates';

import { AffinityLabel } from '../../../../utils/types';

type AffinityExpressionRowProps = {
  expression: AffinityLabel;
  onChange: (label: AffinityLabel) => void;
  onDelete: (id: any) => void;
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

  const onSelectOperator = (_event, selection) => {
    onChange({ ...expression, operator: selection });
  };

  const onSelectValues = (_event, selection) => {
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
          onChange={(_event, newKey) => onChange({ ...expression, key: newKey })}
          placeholder={t('key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={2}>
        <SimpleSelect
          initialOptions={[Operator.Exists, Operator.DoesNotExist, Operator.In, Operator.NotIn].map(
            (operatorOption) => ({
              content: operatorOption,
              selected: operatorOption === operator,
              value: operatorOption,
            }),
          )}
          id={`${rowID}-${id}-effect-select`}
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
