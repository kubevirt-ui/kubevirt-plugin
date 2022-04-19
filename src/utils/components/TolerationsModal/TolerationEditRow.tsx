import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  FormSelect,
  FormSelectOption,
  GridItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { TolerationLabel, TOLERATIONS_EFFECTS } from './utils/constants';

type TolerationEditRowProps = {
  label: TolerationLabel;
  onChange: (label: TolerationLabel) => void;
  onDelete: (id: any) => void;
};

const TolerationEditRow: React.FC<TolerationEditRowProps> = ({ label, onChange, onDelete }) => {
  const { id, key, value, effect } = label;
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-key-input`}
          placeholder={t('Taint key')}
          isRequired
          type="text"
          value={key}
          onChange={(newKey) => onChange({ ...label, key: newKey })}
        />
      </GridItem>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-value-input`}
          placeholder={t('Taint value')}
          isRequired
          type="text"
          value={value}
          onChange={(newValue) => onChange({ ...label, value: newValue })}
        />
      </GridItem>
      <GridItem span={3}>
        <FormSelect
          id={`toleration-${id}-effect-select`}
          isRequired
          value={effect}
          onChange={(newEffect) => onChange({ ...label, effect: newEffect })}
        >
          {TOLERATIONS_EFFECTS.map((effectOption) => (
            <FormSelectOption key={effectOption} value={effectOption} label={effectOption} />
          ))}
        </FormSelect>
      </GridItem>
      <GridItem span={1}>
        <Button
          id={`toleration-${id}-delete-btn`}
          onClick={() => onDelete(id)}
          variant={ButtonVariant.plain}
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </>
  );
};

export default TolerationEditRow;
