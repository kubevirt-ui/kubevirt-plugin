import React, { ClipboardEvent, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { IDLabel } from '../utils/types';

type LabelRowPlainProps = {
  label: IDLabel;
  onChange: (label: IDLabel) => void;
  onDelete: (id: any) => void;
};

const LabelRowPlain: FC<LabelRowPlainProps> = ({ label, onChange, onDelete }) => {
  const { t } = useKubevirtTranslation();
  const { id, key, value } = label;

  const handlePasteLabelKey = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text');
    const strings = text.split('=');

    if (strings.length > 1) return onChange({ ...label, key: strings[0], value: strings[1] });

    return onChange({ ...label, key: text });
  };

  return (
    <>
      <GridItem span={6}>
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
      </GridItem>
      <GridItem span={5}>
        <TextInput
          aria-label={t('selector value')}
          id={`label-${id}-value-input`}
          isRequired
          onChange={(_event, newValue) => onChange({ ...label, value: newValue })}
          placeholder={t('Value')}
          type="text"
          value={value}
        />
      </GridItem>
      <GridItem span={1}>
        <Button icon={<MinusCircleIcon />} onClick={() => onDelete(id)} variant="plain" />
      </GridItem>
    </>
  );
};

export default LabelRowPlain;
