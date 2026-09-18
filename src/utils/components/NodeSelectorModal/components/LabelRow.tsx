import { type ClipboardEvent, type FC, useState } from 'react';

import PlainIconButton from '@kubevirt-utils/components/HardwareDevices/form/PlainIconButton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, HelperText, HelperTextItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { getIncompleteSelectorLabelMessage } from '../utils/helpers';
import { type IDLabel } from '../utils/types';

type LabelRowProps = {
  label: IDLabel;
  onChange: (label: IDLabel) => void;
  onDelete: (id: number) => void;
  withKeyValueTitle?: boolean;
};

const LabelRow: FC<LabelRowProps> = ({ label, onChange, onDelete, withKeyValueTitle = true }) => {
  const { t } = useKubevirtTranslation();
  const { id, key, value } = label;
  const [keyTouched, setKeyTouched] = useState(false);
  const incompleteMessage = keyTouched ? getIncompleteSelectorLabelMessage(key, t) : undefined;
  const errorId = `label-${id}-error`;

  const handlePasteLabelKey = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    setKeyTouched(true);
    const text = event.clipboardData.getData('text');
    const strings = text.split('=');

    if (strings.length > 1) return onChange({ ...label, key: strings[0], value: strings[1] });

    return onChange({ ...label, key: text });
  };

  const keyInput = (
    <TextInput
      aria-describedby={incompleteMessage ? errorId : undefined}
      aria-label={t('selector key')}
      id={`label-${id}-key-input`}
      isRequired
      onBlur={() => setKeyTouched(true)}
      onChange={(_event, newKey) => {
        setKeyTouched(true);
        onChange({ ...label, key: newKey });
      }}
      onPaste={handlePasteLabelKey}
      placeholder={t('Key')}
      type="text"
      validated={incompleteMessage ? 'error' : 'default'}
      value={key}
    />
  );

  const valueInput = (
    <TextInput
      aria-label={t('selector value')}
      id={`label-${id}-value-input`}
      onChange={(_event, newValue) => onChange({ ...label, value: newValue })}
      placeholder={t('Value')}
      type="text"
      value={value}
    />
  );

  return (
    <>
      <GridItem span={6}>
        {withKeyValueTitle ? (
          <FormGroup fieldId={`label-${id}-key-input`} label={t('Key')}>
            {keyInput}
          </FormGroup>
        ) : (
          keyInput
        )}
      </GridItem>
      <GridItem span={5}>
        {withKeyValueTitle ? (
          <FormGroup fieldId={`label-${id}-value-input`} label={t('Value')}>
            {valueInput}
          </FormGroup>
        ) : (
          valueInput
        )}
      </GridItem>
      <PlainIconButton
        fieldId={`label-${id}-delete-btn`}
        icon={<MinusCircleIcon />}
        onClick={() => onDelete(id)}
        withKeyValueTitle={withKeyValueTitle}
      />
      {incompleteMessage && (
        <GridItem span={12}>
          <HelperText data-test={errorId}>
            <HelperTextItem id={errorId} variant="error">
              {incompleteMessage}
            </HelperTextItem>
          </HelperText>
        </GridItem>
      )}
    </>
  );
};

export default LabelRow;
