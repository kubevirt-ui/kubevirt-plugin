import React, { FC, useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateK8sLabelValue } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import {
  Button,
  ButtonVariant,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon } from '@patternfly/react-icons';

import '@settings/tabs/components/settings-label-cell.scss';

type DefaultVMLabelValueCellProps = {
  labelKey: string;
  onSave: (value: string) => void;
  value: string;
};

const DefaultVMLabelValueCell: FC<DefaultVMLabelValueCellProps> = ({ labelKey, onSave, value }) => {
  const { t } = useKubevirtTranslation();
  const [isEditing, setIsEditing] = useState(!value);
  const [editValue, setEditValue] = useState(value);
  const [savedValue, setSavedValue] = useState(value);

  const valueError = isEditing ? validateK8sLabelValue(editValue, t) : undefined;
  const canSave = !valueError;

  const handleSave = useCallback((): void => {
    if (!canSave) return;
    setSavedValue(editValue);
    onSave(editValue);
    setIsEditing(false);
  }, [canSave, editValue, onSave]);

  if (!isEditing) {
    return (
      <Split className="settings-label-cell__row" hasGutter>
        <SplitItem isFilled>{savedValue || t('No value set')}</SplitItem>
        <SplitItem>
          <Button
            aria-label={t('Edit value for {{labelkey}}', { labelKey })}
            icon={<PencilAltIcon />}
            onClick={() => {
              setEditValue(savedValue);
              setIsEditing(true);
            }}
            variant={ButtonVariant.plain}
          />
        </SplitItem>
      </Split>
    );
  }

  return (
    <>
      <Split className="settings-label-cell__row" hasGutter>
        <SplitItem>
          <TextInput
            className="settings-label-cell__value-input"
            aria-label={t('Value for {{labelkey}}', { labelKey })}
            onChange={(_event, val) => setEditValue(val)}
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
            onClick={handleSave}
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

export default DefaultVMLabelValueCell;
