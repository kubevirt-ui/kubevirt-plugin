import * as React from 'react';

import { K8sIoApiCoreV1TolerationEffectEnum } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

import { TolerationLabel } from './utils/constants';

type TolerationEditRowProps = {
  label: TolerationLabel;
  onChange: (label: TolerationLabel) => void;
  onDelete: (id: any) => void;
};

const TolerationEditRow: React.FC<TolerationEditRowProps> = ({ label, onChange, onDelete }) => {
  const { effect, id, key, value } = label;
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-key-input`}
          isRequired
          onChange={(newKey) => onChange({ ...label, key: newKey })}
          placeholder={t('Taint key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-value-input`}
          isRequired
          onChange={(newValue) => onChange({ ...label, value: newValue })}
          placeholder={t('Taint value')}
          type="text"
          value={value}
        />
      </GridItem>
      <GridItem span={3}>
        <FormSelect
          onChange={(newEffect) =>
            onChange({ ...label, effect: newEffect as K8sIoApiCoreV1TolerationEffectEnum })
          }
          id={`toleration-${id}-effect-select`}
          isRequired
          value={effect}
        >
          {Object.values(K8sIoApiCoreV1TolerationEffectEnum).map((effectOption) => (
            <FormSelectOption key={effectOption} label={effectOption} value={effectOption} />
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
