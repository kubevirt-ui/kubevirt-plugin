import React, { FC, useCallback, useState } from 'react';

import { AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateLabelEntry } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';

type AutoAppliedLabelValueCellProps = {
  existingKeys: string[];
  isDisabled: boolean;
  label: AutoAppliedLabel;
  onUpdate: (label: AutoAppliedLabel) => void;
};

const AutoAppliedLabelValueCell: FC<AutoAppliedLabelValueCellProps> = ({
  existingKeys,
  isDisabled,
  label,
  onUpdate,
}) => {
  const { t } = useKubevirtTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label.value);

  const valueError = isEditing
    ? validateLabelEntry(label.key, editValue, t, undefined, existingKeys)
    : undefined;
  const canSave = !valueError && !isDisabled;

  const onSave = useCallback((): void => {
    if (!canSave) return;
    onUpdate({ ...label, value: editValue });
    setIsEditing(false);
  }, [canSave, editValue, label, onUpdate]);

  if (!isEditing) {
    return (
      <Button
        isDisabled={isDisabled}
        isInline
        onClick={() => {
          setEditValue(label.value);
          setIsEditing(true);
        }}
        variant={ButtonVariant.link}
      >
        {label.value || t('Set value')}
      </Button>
    );
  }

  return (
    <>
      <Split hasGutter>
        <SplitItem isFilled>
          <TextInput
            aria-label={t('Value')}
            isDisabled={isDisabled}
            onChange={(_event, value) => setEditValue(value)}
            placeholder={t('Enter a value')}
            validated={valueError ? 'error' : 'default'}
            value={editValue}
          />
        </SplitItem>
        <SplitItem>
          <Button
            aria-label={t('Confirm')}
            icon={<CheckIcon />}
            isDisabled={!canSave}
            onClick={onSave}
            variant={ButtonVariant.plain}
          />
        </SplitItem>
      </Split>
      {valueError && (
        <HelperText>
          <HelperTextItem variant="error">{valueError}</HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export default AutoAppliedLabelValueCell;
