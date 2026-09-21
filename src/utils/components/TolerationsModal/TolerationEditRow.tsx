import { type FC, useState } from 'react';

import { K8sIoApiCoreV1TolerationEffectEnum } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  FormSelect,
  FormSelectOption,
  GridItem,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { type TolerationLabel } from './utils/constants';
import { getTaintKeyRequiredMessage, isIncompleteToleration } from './utils/helpers';

type TolerationEditRowProps = {
  label: TolerationLabel;
  onChange: (label: TolerationLabel) => void;
  onDelete: (id: number) => void;
};

const TolerationEditRow: FC<TolerationEditRowProps> = ({ label, onChange, onDelete }) => {
  const { effect, id, key, value } = label;
  const { t } = useKubevirtTranslation();
  const [keyTouched, setKeyTouched] = useState(false);
  const showKeyError = keyTouched && isIncompleteToleration(label);
  const errorId = `toleration-${id}-error`;

  return (
    <>
      <GridItem span={4}>
        <TextInput
          aria-describedby={showKeyError ? errorId : undefined}
          aria-invalid={showKeyError}
          id={`toleration-${id}-key-input`}
          isRequired
          onBlur={() => setKeyTouched(true)}
          onChange={(_event, newKey) => {
            setKeyTouched(true);
            onChange({ ...label, key: newKey });
          }}
          placeholder={t('Taint key')}
          type="text"
          validated={showKeyError ? 'error' : 'default'}
          value={key}
        />
      </GridItem>
      <GridItem span={4}>
        <TextInput
          id={`toleration-${id}-value-input`}
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
      {showKeyError && (
        <GridItem span={12}>
          <HelperText data-test={errorId}>
            <HelperTextItem id={errorId} variant="error">
              {getTaintKeyRequiredMessage(t)}
            </HelperTextItem>
          </HelperText>
        </GridItem>
      )}
    </>
  );
};

export default TolerationEditRow;
