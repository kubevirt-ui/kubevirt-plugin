import { type FC } from 'react';

import { K8sIoApiCoreV1TolerationEffectEnum } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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

import { type TolerationLabel } from './utils/constants';

type TolerationEditRowProps = {
  label: TolerationLabel;
  onChange: (label: TolerationLabel) => void;
  onDelete: (id: number) => void;
};

const TolerationEditRow: FC<TolerationEditRowProps> = ({ label, onChange, onDelete }) => {
  const { effect, id, key, value } = label;
  const { t } = useKubevirtTranslation();
  return (
    <>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-key-input`}
          isRequired
          onChange={(_event, newKey) => onChange({ ...label, key: newKey })}
          placeholder={t('Taint key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-value-input`}
          isRequired
          onChange={(_event, newValue) => onChange({ ...label, value: newValue })}
          placeholder={t('Taint value')}
          type="text"
          value={value}
        />
      </GridItem>
      <GridItem span={3}>
        <FormSelect
          id={`toleration-${id}-effect-select`}
          isRequired
          onChange={(_event, newEffect) =>
            onChange({ ...label, effect: newEffect as K8sIoApiCoreV1TolerationEffectEnum })
          }
          value={effect}
        >
          {Object.values(K8sIoApiCoreV1TolerationEffectEnum).map((effectOption) => (
            <FormSelectOption key={effectOption} label={effectOption} value={effectOption} />
          ))}
        </FormSelect>
      </GridItem>
      <GridItem span={1}>
        <Button
          icon={<MinusCircleIcon />}
          id={`toleration-${id}-delete-btn`}
          onClick={() => onDelete(id)}
          variant={ButtonVariant.plain}
        />
      </GridItem>
    </>
  );
};

export default TolerationEditRow;
