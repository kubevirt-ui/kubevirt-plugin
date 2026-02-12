import React, { ClipboardEvent, FC } from 'react';

import PlainIconButton from '@kubevirt-utils/components/HardwareDevices/form/PlainIconButton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { IDLabel } from '../utils/types';

type LabelRowProps = {
  label: IDLabel;
  onChange: (label: IDLabel) => void;
  onDelete: (id: any) => void;
  withKeyValueTitle?: boolean;
};

const LabelRow: FC<LabelRowProps> = ({ label, onChange, onDelete, withKeyValueTitle = true }) => {
  const { t } = useKubevirtTranslation();
  const { id, key, value } = label;

  const handlePasteLabelKey = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text');
    const strings = text.split('=');

    if (strings.length > 1) return onChange({ ...label, key: strings[0], value: strings[1] });

    return onChange({ ...label, key: text });
  };

  const keyInput = (
    <TextInput
      aria-label={t('selector key')}
      id={`label-${id}-key-input`}
      isRequired
      onChange={(_event, newKey) => onChange({ ...label, key: newKey })}
      onPaste={handlePasteLabelKey}
      placeholder={t('Key')}
      type="text"
      value={key}
    />
  );

  const valueInput = (
    <TextInput
      aria-label={t('selector value')}
      id={`label-${id}-value-input`}
      isRequired
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
    </>
  );
};

export default LabelRow;
